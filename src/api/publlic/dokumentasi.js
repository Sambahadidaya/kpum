'use server';

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Server Action: Mengambil data dokumentasi kegiatan KPU untuk portal publik
 */
export async function getPublikDokumentasi() {
  try {
    const { data, error } = await supabaseAdmin
      .from('dukomentasi')
      .select('id, judul_dokumentasi, tanggal_dokumentasi, link_drive, deskripsi')
      .order('tanggal_dokumentasi', { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
