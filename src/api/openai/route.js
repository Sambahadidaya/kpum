'use server';

import { openai, OPENAI_MODEL } from '@/lib/openai';
import { KPU_FAQ_DATA, SYSTEM_PROMPT_KPU } from '@/data/faqDataAi';
import { checkRateLimit } from '@/scurity/rateLimiter';
import { headers } from 'next/headers';

/**
 * Server Action: Chat dengan Sams Asisten KPU Mahasiswa LP3I
 * @param {Array<{role: string, content: string}>} messages Riwayat percakapan
 * @returns {Promise<{success: boolean, reply?: string, error?: string}>}
 */
export async function chatDenganSamsAsisten(messages = []) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Rate limit: Maksimal 12 pertanyaan per menit per IP
    const allowed = checkRateLimit(`ai_${clientIp}`, 12, 60 * 1000);
    if (!allowed) {
      return {
        success: false,
        error: 'Terlalu banyak pertanyaan. Mohon tunggu sejenak sebelum bertanya lagi kepada Sams Asisten.',
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: true,
        reply: 'Halo! Mohon maaf, kunci API OpenAI belum dikonfigurasi di environment server. Namun Anda dapat membaca panduan lengkap Pemilu di menu **Panduan** atau menghubungi panitia melalui menu **Kontak**.',
      };
    }

    // Format basis pengetahuan FAQ KPU sebagai context injection
    const faqContext = KPU_FAQ_DATA.map(
      (item, idx) => `[FAQ ${idx + 1}] Kategori: ${item.kategori}\nTanya: ${item.pertanyaan}\nJawab: ${item.jawaban}`
    ).join('\n\n');

    const systemMessage = {
      role: 'system',
      content: `${SYSTEM_PROMPT_KPU}\n\n--- BASIS PENGETAHUAN FAQ KPU LP3I ---\n${faqContext}\n--------------------------------------`,
    };

    // Ambil maksimal 8 pesan terakhir agar hemat token
    const recentMessages = (messages || []).slice(-8).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, 500),
    }));

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [systemMessage, ...recentMessages],
      temperature: 1,
      // max_tokens: 600,
      max_completion_tokens: 500,
    });

    const reply = response.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses jawaban saat ini.';

    return {
      success: true,
      reply,
    };
  } catch (error) {
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
    const result = await chatDenganSamsAsisten(body.messages || []);
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
