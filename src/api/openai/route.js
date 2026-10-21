'use server';

import { openai, OPENAI_MODEL } from '@/lib/openai';
import { KPU_FAQ_DATA, SYSTEM_PROMPT_KPU } from '@/data/faqDataAi';
import { checkRateLimit } from '@/scurity/rateLimiter';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { nanoid } from 'nanoid';

// In-memory cache untuk meminimalkan beban query database
let cachedConfig = {
  setting: null,
  faqList: null,
  timestamp: 0,
};
const CACHE_TTL_MS = 60 * 1000; // 1 Menit Cache

/**
 * Mengambil setting dan data FAQ dengan in-memory cache
 */
async function getCachedAiConfig() {
  const now = Date.now();
  if (
    cachedConfig.setting &&
    cachedConfig.faqList &&
    now - cachedConfig.timestamp < CACHE_TTL_MS
  ) {
    return cachedConfig;
  }

  try {
    const [settingRes, faqRes] = await Promise.all([
      supabaseAdmin
        .from('ai_setting')
        .select('system_prompt, bahasa_diizinkan, max_tokens, temperature, rate_limit_per_menit')
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from('ai_faq')
        .select('kategori, pertanyaan, jawaban, urutan')
        .eq('is_active', true)
        .order('urutan', { ascending: true }),
    ]);

    const setting = settingRes.data || {
      system_prompt: SYSTEM_PROMPT_KPU,
      bahasa_diizinkan: 'id,en',
      max_tokens: 500,
      temperature: 1.0,
      rate_limit_per_menit: 12,
    };

    const faqList = (faqRes.data && faqRes.data.length > 0)
      ? faqRes.data
      : KPU_FAQ_DATA;

    cachedConfig = {
      setting,
      faqList,
      timestamp: now,
    };

    return cachedConfig;
  } catch (e) {
    // Fallback jika database tidak dapat dijangkau
    return {
      setting: {
        system_prompt: SYSTEM_PROMPT_KPU,
        bahasa_diizinkan: 'id,en',
        max_tokens: 500,
        temperature: 1.0,
        rate_limit_per_menit: 12,
      },
      faqList: KPU_FAQ_DATA,
      timestamp: now,
    };
  }
}

/**
 * Mencatat log percakapan AI secara asinkron tanpa memblokir response
 */
function logAiChatAsync(payload) {
  // Jalankan asinkron non-blocking
  Promise.resolve().then(async () => {
    try {
      await supabaseAdmin.from('ai_log').insert({
        session_id: payload.sessionId || nanoid(10),
        ip_address: payload.ipAddress || '127.0.0.1',
        pertanyaan: payload.pertanyaan ? String(payload.pertanyaan).slice(0, 2000) : null,
        jawaban: payload.jawaban ? String(payload.jawaban).slice(0, 3000) : null,
        tokens_input: Math.min(32767, Number(payload.tokensInput) || 0),
        tokens_output: Math.min(32767, Number(payload.tokensOutput) || 0),
        total_tokens: Math.min(32767, Number(payload.totalTokens) || 0),
        processing_ms: Math.min(32767, Number(payload.processingMs) || 0),
        latency_ms: Math.min(32767, Number(payload.latencyMs) || 0),
        status: payload.status || 's',
        matched_faq: Boolean(payload.matchedFaq),
        error_msg: payload.errorMsg ? String(payload.errorMsg).slice(0, 255) : null,
      });
    } catch (err) {
      // Abaikan error logging agar user experience tetap lancar
      console.error('[AI Log Error]:', err.message);
    }
  });
}

/**
 * Mendeteksi apakah pertanyaan pengguna cocok dengan salah satu FAQ
 */
function checkFaqMatch(userQuery, faqList) {
  if (!userQuery || !faqList || faqList.length === 0) return false;
  const qLower = userQuery.toLowerCase().trim();

  return faqList.some((faq) => {
    const faqLower = (faq.pertanyaan || '').toLowerCase().trim();
    if (qLower === faqLower || qLower.includes(faqLower) || faqLower.includes(qLower)) {
      return true;
    }
    // Cek kesamaan kata kunci utama (minimal 3 kata cocok)
    const qWords = qLower.split(/\s+/).filter((w) => w.length > 3);
    const faqWords = faqLower.split(/\s+/).filter((w) => w.length > 3);
    const commonWords = qWords.filter((w) => faqWords.includes(w));
    return commonWords.length >= 2;
  });
}

/**
 * Server Action: Chat dengan Sams Asisten KPU Mahasiswa LP3I
 * @param {Array<{role: string, content: string}>} messages Riwayat percakapan
 * @param {string} sessionId ID sesi percakapan (opsional)
 * @returns {Promise<{success: boolean, reply?: string, error?: string}>}
 */
export async function chatDenganSamsAsisten(messages = [], sessionId = '') {
  const startTime = Date.now();
  let clientIp = '127.0.0.1';
  let lastUserMessage = '';

  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Cari pesan terakhir dari user
    const lastMsgObj = [...(messages || [])].reverse().find((m) => m.role === 'user');
    lastUserMessage = lastMsgObj?.content || '';

    // Ambil konfigurasi dinamis & FAQ dari cache / database
    const { setting, faqList } = await getCachedAiConfig();

    const rateLimitMax = setting.rate_limit_per_menit || 12;
    const allowed = checkRateLimit(`ai_${clientIp}`, rateLimitMax, 60 * 1000);

    if (!allowed) {
      const latencyMs = Date.now() - startTime;
      logAiChatAsync({
        sessionId,
        ipAddress: clientIp,
        pertanyaan: lastUserMessage,
        jawaban: 'Rate limited',
        status: 'r',
        latencyMs,
        errorMsg: 'Rate limit exceeded',
      });

      return {
        success: false,
        error: 'Terlalu banyak pertanyaan. Mohon tunggu sejenak sebelum bertanya lagi kepada Sams Asisten.',
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      const fallbackReply = 'Halo! Mohon maaf, kunci API OpenAI belum dikonfigurasi di environment server. Namun Anda dapat membaca panduan lengkap Pemilu di menu **Panduan** atau menghubungi panitia melalui menu **Kontak**.';
      const latencyMs = Date.now() - startTime;

      logAiChatAsync({
        sessionId,
        ipAddress: clientIp,
        pertanyaan: lastUserMessage,
        jawaban: fallbackReply,
        status: 's',
        latencyMs,
        matchedFaq: false,
      });

      return {
        success: true,
        reply: fallbackReply,
      };
    }

    // Deteksi kecocokan FAQ
    const isMatchedFaq = checkFaqMatch(lastUserMessage, faqList);

    // Format basis pengetahuan FAQ KPU sebagai context injection
    const faqContext = faqList.map(
      (item, idx) => `[FAQ ${idx + 1}] Kategori: ${item.kategori}\nTanya: ${item.pertanyaan}\nJawab: ${item.jawaban}`
    ).join('\n\n');

    const systemPromptText = setting.system_prompt || SYSTEM_PROMPT_KPU;
    const allowedLangs = setting.bahasa_diizinkan ? `\nBahasa yang diizinkan untuk Anda layani: ${setting.bahasa_diizinkan}.` : '';

    const systemMessage = {
      role: 'system',
      content: `${systemPromptText}${allowedLangs}\n\n--- BASIS PENGETAHUAN FAQ KPU LP3I ---\n${faqContext}\n--------------------------------------`,
    };

    // Ambil maksimal 8 pesan terakhir agar hemat token
    const recentMessages = (messages || []).slice(-8).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, 600),
    }));

    const maxTokens = setting.max_tokens || 500;
    const temperature = Number(setting.temperature) || 1.0;

    const processStart = Date.now();
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [systemMessage, ...recentMessages],
      temperature,
      max_completion_tokens: maxTokens,
    });
    const processingMs = Date.now() - processStart;
    const latencyMs = Date.now() - startTime;

    const reply = response.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses jawaban saat ini.';
    const usage = response.usage || {};

    const tokensInput = usage.prompt_tokens || 0;
    const tokensOutput = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || tokensInput + tokensOutput;

    // Catat log sukses ke ai_log secara non-blocking
    logAiChatAsync({
      sessionId,
      ipAddress: clientIp,
      pertanyaan: lastUserMessage,
      jawaban: reply,
      tokensInput,
      tokensOutput,
      totalTokens,
      processingMs,
      latencyMs,
      status: 's',
      matchedFaq: isMatchedFaq,
    });

    return {
      success: true,
      reply,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    logAiChatAsync({
      sessionId,
      ipAddress: clientIp,
      pertanyaan: lastUserMessage,
      jawaban: null,
      tokensInput: 0,
      tokensOutput: 0,
      totalTokens: 0,
      processingMs: 0,
      latencyMs,
      status: 'e',
      matchedFaq: false,
      errorMsg: error.message || 'Unknown error',
    });

    return {
      success: false,
      error: error.message || 'Terjadi gangguan koneksi ke layanan AI.',
    };
  }
}

// Fallback Route Handler POST jika ada pemanggilan melalui fetch HTTP biasa
export async function POST(req) {
  try {
    const body = await req.json();
    const result = await chatDenganSamsAsisten(body.messages || [], body.sessionId || '');
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
