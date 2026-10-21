'use server';

import { unstable_cache } from 'next/cache';
import { openai, OPENAI_MODEL } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase';
import { nanoid } from 'nanoid';

/**
 * Mencatat log pemakaian AI Translate secara asinkron tanpa memblokir response
 */
function logAiTranslateAsync(payload) {
  Promise.resolve().then(async () => {
    try {
      await supabaseAdmin.from('ai_log').insert({
        session_id: payload.sessionId || `trans-${nanoid(8)}`,
        ip_address: payload.ipAddress || '127.0.0.1',
        pertanyaan: payload.pertanyaan ? String(payload.pertanyaan).slice(0, 2000) : null,
        jawaban: payload.jawaban ? String(payload.jawaban).slice(0, 3000) : null,
        tokens_input: Math.min(32767, Number(payload.tokensInput) || 0),
        tokens_output: Math.min(32767, Number(payload.tokensOutput) || 0),
        total_tokens: Math.min(32767, Number(payload.totalTokens) || 0),
        processing_ms: Math.min(32767, Number(payload.processingMs) || 0),
        latency_ms: Math.min(32767, Number(payload.latencyMs) || 0),
        status: payload.status || 's',
        matched_faq: false,
        error_msg: payload.errorMsg ? String(payload.errorMsg).slice(0, 255) : null,
      });
    } catch (err) {
      console.error('[dynamicTranslate:Log Error]:', err.message);
    }
  });
}

/**
 * Server Action Translator untuk Teks Database dengan Caching Vercel Data Cache
 * Menerjemahkan batch teks atau teks tunggal dari database secara efisien.
 *
 * @param {string|object} content Teks atau objek berisi field teks yang akan diterjemahkan
 * @param {string} targetLang Kode bahasa target (misal: 'en')
 * @param {string} cacheKeyIdentifier Kunci unik identitas data (misal: 'kandidat-123')
 */
async function translateWithOpenAI(content, targetLang = 'en', cacheKeyIdentifier = 'generic') {
  if (!content) return content;
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[dynamicTranslate] OPENAI_API_KEY tidak ditemukan.');
    return null;
  }

  const startTime = Date.now();
  let clientIp = '127.0.0.1';

  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  } catch (e) {
    clientIp = '127.0.0.1';
  }

  const isObject = typeof content === 'object' && content !== null;
  const contentString = isObject ? JSON.stringify(content) : String(content);
  const langName = targetLang === 'en' ? 'English (US)' : targetLang;

  const systemPrompt = isObject
    ? `You are a professional translator for a Student University Election website. Translate all string values inside the given JSON from Indonesian to ${langName}. Preserve the JSON keys and structure exactly. Only return valid JSON without Markdown code fences.`
    : `You are a professional translator for a Student University Election website. Translate the given text from Indonesian to ${langName}. Keep the tone polite, formal, and accurate. Return only the translated text.`;

  const modelToUse = (process.env.OPENAI_MODEL && process.env.OPENAI_MODEL)
    ? process.env.OPENAI_MODEL
    : 'gpt-4o-mini';

  try {
    const processStart = Date.now();
    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contentString },
      ],
      temperature: 1,
    });
    const processingMs = Date.now() - processStart;
    const latencyMs = Date.now() - startTime;

    const translatedRaw = response.choices?.[0]?.message?.content?.trim() || '';
    if (!translatedRaw) {
      logAiTranslateAsync({
        sessionId: `trans-${targetLang}-${nanoid(6)}`,
        ipAddress: clientIp,
        pertanyaan: `[Translate:${targetLang}:${cacheKeyIdentifier}] ${contentString.slice(0, 1800)}`,
        jawaban: null,
        tokensInput: 0,
        tokensOutput: 0,
        totalTokens: 0,
        processingMs,
        latencyMs,
        status: 'e',
        errorMsg: 'Empty response choices from OpenAI',
      });
      return null;
    }

    const usage = response.usage || {};
    const tokensInput = usage.prompt_tokens || 0;
    const tokensOutput = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || (tokensInput + tokensOutput);

    // Catat ke ai_log secara non-blocking
    logAiTranslateAsync({
      sessionId: `trans-${targetLang}-${nanoid(6)}`,
      ipAddress: clientIp,
      pertanyaan: `[Translate:${targetLang}:${cacheKeyIdentifier}] ${contentString.slice(0, 1800)}`,
      jawaban: `[Translated:${targetLang}] ${translatedRaw.slice(0, 2800)}`,
      tokensInput,
      tokensOutput,
      totalTokens,
      processingMs,
      latencyMs,
      status: 's',
    });

    if (isObject) {
      try {
        const cleanJson = translatedRaw.replace(/^```json\s*|\s*```$/g, '');
        return JSON.parse(cleanJson);
      } catch (err) {
        console.error('[dynamicTranslate] JSON parse error:', err);
        return null;
      }
    }

    return translatedRaw;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    logAiTranslateAsync({
      sessionId: `trans-${targetLang}-${nanoid(6)}`,
      ipAddress: clientIp,
      pertanyaan: `[Translate:${targetLang}:${cacheKeyIdentifier}] ${contentString.slice(0, 1800)}`,
      jawaban: null,
      tokensInput: 0,
      tokensOutput: 0,
      totalTokens: 0,
      processingMs: 0,
      latencyMs,
      status: 'e',
      errorMsg: error.message || 'Translation error',
    });
    console.error('[dynamicTranslate] API error:', error.message);
    return null;
  }
}

/**
 * Wrapper Cache Vercel / Next.js Data Cache
 * Menyimpan hasil translasi dalam cache persisten (revalidate 86400 * 7 detik / 7 hari).
 * Pengunjung berikutnya yang membuka data yang sama langsung membaca dari cache!
 */
export async function getCachedTranslation(content, targetLang = 'en', cacheKeyIdentifier = 'generic') {
  if (!content || targetLang === 'id') {
    return content;
  }

  // Hash isi teks agar cache otomatis berganti jika data di database diubah
  const raw = typeof content === 'object' ? JSON.stringify(content) : String(content);
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) hash = ((hash << 5) + hash + raw.charCodeAt(i)) | 0;
  const contentHash = (hash >>> 0).toString(36);

  const cacheKey = `dyn-trans-v2-${cacheKeyIdentifier}-${targetLang}-${contentHash}`;

  try {
    const cachedFn = unstable_cache(
      async () => {
        const translated = await translateWithOpenAI(content, targetLang, cacheKeyIdentifier);
        if (!translated) {
          throw new Error('Translation failed or empty, do not cache');
        }
        return translated;
      },
      [cacheKey],
      {
        revalidate: 86400 * 1,
        tags: ['translations', `trans-${cacheKeyIdentifier}`],
      }
    );

    return await cachedFn();
  } catch (err) {
    console.error(`[dynamicTranslate:${cacheKeyIdentifier}] fallback to original:`, err.message);
    return content;
  }
}
