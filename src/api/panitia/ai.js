'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission, requirePanitiaEditor } from '@/utils/supabaseUtils';
import { sanitizeText } from '@/scurity/sanitaze';

/**
 * Mengambil ringkasan statistik dan metrik analitik AI Chatbot
 * @param {number|string} days Jumlah hari analisis (7, 14, 30, atau 'all')
 */
export async function getAiStats(days = 7) {
  try {
    await requirePanitiaPermission('ai');

    let query = supabaseAdmin
      .from('ai_log')
      .select('id, session_id, tokens_input, tokens_output, total_tokens, processing_ms, latency_ms, status, matched_faq, created_at')
      .order('created_at', { ascending: true });

    if (days !== 'all' && Number(days) > 0) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - Number(days));
      query = query.gte('created_at', pastDate.toISOString());
    }

    const { data: logs, error } = await query;
    if (error) {
      return { success: false, error: error.message, data: null };
    }

    const totalLogs = logs.length;
    let totalTokens = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalProcessingMs = 0;
    let totalLatencyMs = 0;

    let successCount = 0;
    let errorCount = 0;
    let rejectedCount = 0;
    let matchedFaqCount = 0;

    // Daily aggregation map: date -> { total, success, error, rejected, tokens, avgProcessing, countProcessing }
    const dailyMap = {};

    logs.forEach((log) => {
      totalTokens += log.total_tokens || 0;
      totalInputTokens += log.tokens_input || 0;
      totalOutputTokens += log.tokens_output || 0;
      totalProcessingMs += log.processing_ms || 0;
      totalLatencyMs += log.latency_ms || 0;

      if (log.status === 's') successCount++;
      else if (log.status === 'e') errorCount++;
      else if (log.status === 'r') rejectedCount++;

      if (log.matched_faq) matchedFaqCount++;

      const dateKey = new Date(log.created_at).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: dateKey,
          total: 0,
          success: 0,
          error: 0,
          rejected: 0,
          tokens: 0,
          tokensInput: 0,
          tokensOutput: 0,
          sumProcessing: 0,
          countProcessing: 0,
        };
      }

      dailyMap[dateKey].total++;
      if (log.status === 's') dailyMap[dateKey].success++;
      if (log.status === 'e') dailyMap[dateKey].error++;
      if (log.status === 'r') dailyMap[dateKey].rejected++;

      dailyMap[dateKey].tokens += log.total_tokens || 0;
      dailyMap[dateKey].tokensInput += log.tokens_input || 0;
      dailyMap[dateKey].tokensOutput += log.tokens_output || 0;
      if (log.processing_ms) {
        dailyMap[dateKey].sumProcessing += log.processing_ms;
        dailyMap[dateKey].countProcessing++;
      }
    });

    const dailyTrends = Object.values(dailyMap).map((d) => ({
      date: d.date,
      total: d.total,
      success: d.success,
      error: d.error,
      rejected: d.rejected,
      tokens: d.tokens,
      tokensInput: d.tokensInput,
      tokensOutput: d.tokensOutput,
      avgProcessingMs: d.countProcessing > 0 ? Math.round(d.sumProcessing / d.countProcessing) : 0,
    }));

    return {
      success: true,
      data: {
        totalQueries: totalLogs,
        totalTokens,
        totalInputTokens,
        totalOutputTokens,
        avgProcessingMs: totalLogs > 0 ? Math.round(totalProcessingMs / totalLogs) : 0,
        avgLatencyMs: totalLogs > 0 ? Math.round(totalLatencyMs / totalLogs) : 0,
        successCount,
        errorCount,
        rejectedCount,
        matchedFaqCount,
        successRate: totalLogs > 0 ? Number(((successCount / totalLogs) * 100).toFixed(1)) : 100,
        faqMatchRate: totalLogs > 0 ? Number(((matchedFaqCount / totalLogs) * 100).toFixed(1)) : 0,
        dailyTrends,
      },
    };
  } catch (err) {
    return { success: false, error: err.message, data: null };
  }
}

/**
/**
 * Mengambil daftar log chat mentah secara terpaginasi untuk tabel analitik & riwayat log
 */
export async function getAiLogs({ limit = 50, page = 1, status = 'all', search = '', date = '' } = {}) {
  try {
    await requirePanitiaPermission('ai');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('ai_log')
      .select('id, session_id, ip_address, pertanyaan, jawaban, tokens_input, tokens_output, total_tokens, processing_ms, latency_ms, status, matched_faq, error_msg, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search && search.trim()) {
      query = query.ilike('pertanyaan', `%${search.trim()}%`);
    }

    if (date && date.trim()) {
      const startOfDay = `${date.trim()}T00:00:00.000Z`;
      const endOfDay = `${date.trim()}T23:59:59.999Z`;
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, count, error } = await query;
    if (error) return { success: false, error: error.message, data: [], count: 0 };

    return { success: true, data: data || [], count: count || 0, page, limit };
  } catch (err) {
    return { success: false, error: err.message, data: [], count: 0 };
  }
}

/**
 * Menghapus 1 baris log AI berdasarkan ID
 */
export async function hapusAiLogById(id) {
  try {
    await requirePanitiaEditor('ai');

    if (!id) return { success: false, error: 'ID log tidak valid.' };

    const { error } = await supabaseAdmin
      .from('ai_log')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Catatan log AI berhasil dihapus.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Hapus seluruh data log AI (Reset Total)
 */
export async function hapusSemuaAiLog() {
  try {
    await requirePanitiaEditor('ai');

    const { error } = await supabaseAdmin
      .from('ai_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Seluruh riwayat log AI berhasil dibersihkan.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Hapus log AI pada tanggal tertentu (format YYYY-MM-DD)
 */
export async function hapusAiLogPerTanggal(targetDate) {
  try {
    await requirePanitiaEditor('ai');

    if (!targetDate) return { success: false, error: 'Tanggal wajib ditentukan.' };

    const start = `${targetDate}T00:00:00.000Z`;
    const end = `${targetDate}T23:59:59.999Z`;

    const { error } = await supabaseAdmin
      .from('ai_log')
      .delete()
      .gte('created_at', start)
      .lte('created_at', end);

    if (error) return { success: false, error: error.message };
    return { success: true, message: `Data log AI pada tanggal ${targetDate} berhasil dihapus.` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Hapus log AI yang lebih lama dari N hari
 */
export async function hapusAiLogLebihLamaDari(intervalHari) {
  try {
    await requirePanitiaEditor('ai');

    const days = parseInt(intervalHari, 10);
    if (isNaN(days) || days < 1) {
      return { success: false, error: 'Interval hari tidak valid.' };
    }

    const batasWaktu = new Date();
    batasWaktu.setDate(batasWaktu.getDate() - days);

    const { error } = await supabaseAdmin
      .from('ai_log')
      .delete()
      .lt('created_at', batasWaktu.toISOString());

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      message: `Data log AI yang lebih lama dari ${days} hari berhasil dibersihkan.`,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Mengambil daftar seluruh FAQ AI
 */
export async function getAiFaqList() {
  try {
    await requirePanitiaPermission('ai');

    const { data, error } = await supabaseAdmin
      .from('ai_faq')
      .select('id, kategori, pertanyaan, jawaban, urutan, is_active, created_at, updated_at')
      .order('urutan', { ascending: true });

    if (error) return { success: false, error: error.message, data: [] };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Menyimpan / memperbarui item FAQ AI
 */
export async function saveAiFaq(payload) {
  try {
    await requirePanitiaEditor('ai');

    const id = payload.id;
    const cleanKategori = sanitizeText(payload.kategori || 'Umum');
    const cleanPertanyaan = sanitizeText(payload.pertanyaan || '');
    const cleanJawaban = typeof payload.jawaban === 'string' ? payload.jawaban.trim() : '';
    const urutan = Number(payload.urutan) || 1;
    const isActive = payload.is_active !== undefined ? Boolean(payload.is_active) : true;

    if (!cleanPertanyaan || !cleanJawaban) {
      return { success: false, error: 'Pertanyaan dan jawaban wajib diisi.' };
    }

    if (id) {
      const { data, error } = await supabaseAdmin
        .from('ai_faq')
        .update({
          kategori: cleanKategori,
          pertanyaan: cleanPertanyaan,
          jawaban: cleanJawaban,
          urutan,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const { data, error } = await supabaseAdmin
        .from('ai_faq')
        .insert({
          kategori: cleanKategori,
          pertanyaan: cleanPertanyaan,
          jawaban: cleanJawaban,
          urutan,
          is_active: isActive,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle status aktif item FAQ AI
 */
export async function toggleAiFaq(id, isActive) {
  try {
    await requirePanitiaEditor('ai');

    const { error } = await supabaseAdmin
      .from('ai_faq')
      .update({ is_active: Boolean(isActive), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus item FAQ AI
 */
export async function deleteAiFaq(id) {
  try {
    await requirePanitiaEditor('ai');

    const { error } = await supabaseAdmin
      .from('ai_faq')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Mengambil konfigurasi setting AI dari DB (hanya 1 baris aktif)
 */
export async function getAiSetting() {
  try {
    await requirePanitiaPermission('ai');

    const { data, error } = await supabaseAdmin
      .from('ai_setting')
      .select('id, system_prompt, bahasa_diizinkan, max_tokens, temperature, rate_limit_per_menit, updated_at')
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, error: error.message, data: null };

    // Default jika belum ada baris di DB
    const setting = data || {
      system_prompt: 'Anda adalah "Sams Asisten", asisten cerdas virtual resmi dari KPU Mahasiswa Pemilu Presma BEM Politeknik LP3I.\nTugas Anda:\n1. Berikan informasi akurat, ramah, profesional seputar Pemilu Mahasiswa.\n2. Gunakan bahasa sopan dan mudah dipahami mahasiswa.\n3. Jawab berdasarkan data FAQ KPU jika relevan. Jika di luar konteks, arahkan ke menu Panduan atau Kontak.\n4. Jangan memihak paslon manapun. Jaga netralitas KPU.',
      bahasa_diizinkan: 'id,en',
      max_tokens: 500,
      temperature: 1.0,
      rate_limit_per_menit: 12,
    };

    return { success: true, data: setting };
  } catch (err) {
    return { success: false, error: err.message, data: null };
  }
}

/**
 * Menyimpan konfigurasi setting AI ke DB
 */
export async function saveAiSetting(payload) {
  try {
    await requirePanitiaEditor('ai');

    const systemPrompt = typeof payload.system_prompt === 'string' ? payload.system_prompt.trim() : '';
    const bahasaDiizinkan = typeof payload.bahasa_diizinkan === 'string' ? payload.bahasa_diizinkan.trim() : 'id,en';
    const maxTokens = Math.max(50, Math.min(2000, Number(payload.max_tokens) || 500));
    const temperature = Math.max(0, Math.min(2, Number(payload.temperature) || 1.0));
    const rateLimit = Math.max(1, Math.min(120, Number(payload.rate_limit_per_menit) || 12));

    if (!systemPrompt) {
      return { success: false, error: 'System prompt wajib diisi.' };
    }

    // Ambil setting eksisting jika ada
    const { data: existing } = await supabaseAdmin
      .from('ai_setting')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing?.id) {
      result = await supabaseAdmin
        .from('ai_setting')
        .update({
          system_prompt: systemPrompt,
          bahasa_diizinkan: bahasaDiizinkan,
          max_tokens: maxTokens,
          temperature,
          rate_limit_per_menit: rateLimit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('ai_setting')
        .insert({
          system_prompt: systemPrompt,
          bahasa_diizinkan: bahasaDiizinkan,
          max_tokens: maxTokens,
          temperature,
          rate_limit_per_menit: rateLimit,
        })
        .select()
        .single();
    }

    if (result.error) return { success: false, error: result.error.message };
    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
