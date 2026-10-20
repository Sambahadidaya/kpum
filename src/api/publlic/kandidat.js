'use server';

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Server Action: Mengambil data seluruh kandidat untuk portal publik
 */
export async function getPublikKandidat() {
  try {
    const { data, error } = await supabaseAdmin
      .from('kandidat')
      .select(`
        id,
        nama_kandidat,
        nim_kandidat,
        prodi_kandidat,
        fotodiri_kandidat,
        posisi,
        is_eliminated,
        created_at,
        detail_kandidat (
          id,
          visi,
          misi
        )
      `)
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
 * Server Action: Mengambil data pasangan calon (paslon) untuk portal publik jika tersedia
 */
export async function getPublikPaslon() {
  try {
    const { data, error } = await supabaseAdmin
      .from('paslon')
      .select(`
        id,
        nomor_urut,
        slogan,
        kandidat1:kandidat1_id (id, nama_kandidat, nim_kandidat, prodi_kandidat, fotodiri_kandidat, posisi),
        kandidat2:kandidat2_id (id, nama_kandidat, nim_kandidat, prodi_kandidat, fotodiri_kandidat, posisi)
      `)
      .order('nomor_urut', { ascending: true });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
