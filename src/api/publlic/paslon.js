'use server';

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Mengambil daftar pasangan calon (paslon) resmi untuk ditampilkan di portal publik
 */
export async function getPublikPaslonList() {
  try {
    const { data, error } = await supabaseAdmin
      .from('paslon')
      .select(`
        id,
        nomor_urut,
        slogan,
        created_at,
        kandidat1:kandidat1_id (
          id,
          nama_kandidat,
          nim_kandidat,
          prodi_kandidat,
          fotodiri_kandidat,
          posisi,
          is_eliminated,
          detail_kandidat (
            id,
            notlpn_wa_kandidat,
            emailplb_kandidat,
            cv_portofolio_kandidat,
            visi,
            misi
          )
        ),
        kandidat2:kandidat2_id (
          id,
          nama_kandidat,
          nim_kandidat,
          prodi_kandidat,
          fotodiri_kandidat,
          posisi,
          is_eliminated,
          detail_kandidat (
            id,
            notlpn_wa_kandidat,
            emailplb_kandidat,
            cv_portofolio_kandidat,
            visi,
            misi
          )
        )
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
