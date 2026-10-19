'use server';

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Server Action: Mengambil data seluruh panitia untuk portal publik
 */
export async function getPublikPanitia() {
  try {
    const { data, error } = await supabaseAdmin
      .from('panitia')
      .select(`
        id,
        nama_panitia,
        prodi_panitia,
        jabatan_panitia,
        sub_jabatan_panitia,
        foto_panitia,
        bg_image,
        urutan,
        created_at,
        sosmed_panitia (
          id,
          whatsapp,
          instagram,
          threads,
          tiktok
        )
      `)
      .order('urutan', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Server Action: Mencatat riwayat klik tautan sosial media panitia beserta platformnya
 */
export async function recordTrafikSosmed(sosmedId, platform = null) {
  try {
    if (!sosmedId) return { success: false, error: 'sosmedId tidak ditemukan' };

    // Coba simpan beserta platform jika kolom sudah tersedia
    if (platform) {
      const { error: insertWithPlatformErr } = await supabaseAdmin
        .from('trafik_sosmed')
        .insert({ sosmed_id: sosmedId, platform: platform.toLowerCase() });

      if (!insertWithPlatformErr) {
        return { success: true };
      }
    }

    // Fallback jika kolom platform belum ada di tabel atau tanpa platform
    const { error } = await supabaseAdmin
      .from('trafik_sosmed')
      .insert({ sosmed_id: sosmedId });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

