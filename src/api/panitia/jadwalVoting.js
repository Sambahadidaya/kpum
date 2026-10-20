'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission, requirePanitiaEditor } from '@/utils/supabaseUtils';

/**
 * Mengambil seluruh riwayat jadwal voting
 */
export async function getPanitiaJadwalVotingList() {
  try {
    await requirePanitiaPermission('voting');

    const { data, error } = await supabaseAdmin
      .from('jadwal_voting')
      .select('*')
      .order('waktu_mulai', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menambah jadwal voting baru (Hanya untuk Editor)
 */
export async function tambahJadwalVoting({ waktu_mulai, waktu_berakhir }) {
  try {
    await requirePanitiaEditor('voting');

    if (!waktu_mulai || !waktu_berakhir) {
      return { success: false, error: 'Waktu mulai dan waktu berakhir harus diisi.' };
    }

    const startTs = new Date(waktu_mulai).getTime();
    const endTs = new Date(waktu_berakhir).getTime();

    if (isNaN(startTs) || isNaN(endTs)) {
      return { success: false, error: 'Format waktu tidak valid.' };
    }

    if (startTs >= endTs) {
      return { success: false, error: 'Waktu mulai harus lebih awal dari waktu berakhir.' };
    }

    const { data, error } = await supabaseAdmin
      .from('jadwal_voting')
      .insert([
        {
          waktu_mulai: new Date(waktu_mulai).toISOString(),
          waktu_berakhir: new Date(waktu_berakhir).toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Mengubah jadwal voting yang sudah ada (Hanya untuk Editor)
 */
export async function updateJadwalVoting({ id, waktu_mulai, waktu_berakhir }) {
  try {
    await requirePanitiaEditor('voting');

    if (!id || !waktu_mulai || !waktu_berakhir) {
      return { success: false, error: 'ID, waktu mulai, dan waktu berakhir harus diisi.' };
    }

    const startTs = new Date(waktu_mulai).getTime();
    const endTs = new Date(waktu_berakhir).getTime();

    if (isNaN(startTs) || isNaN(endTs)) {
      return { success: false, error: 'Format waktu tidak valid.' };
    }

    if (startTs >= endTs) {
      return { success: false, error: 'Waktu mulai harus lebih awal dari waktu berakhir.' };
    }

    const { data, error } = await supabaseAdmin
      .from('jadwal_voting')
      .update({
        waktu_mulai: new Date(waktu_mulai).toISOString(),
        waktu_berakhir: new Date(waktu_berakhir).toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus jadwal voting (Hanya untuk Editor)
 */
export async function hapusJadwalVoting(id) {
  try {
    await requirePanitiaEditor('voting');

    if (!id) {
      return { success: false, error: 'ID jadwal voting tidak valid.' };
    }

    const { error } = await supabaseAdmin
      .from('jadwal_voting')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
