'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { getCachedTranslation } from '@/api/publlic/dynamicTranslate';

/**
 * Mengambil daftar pasangan calon (paslon) resmi untuk ditampilkan di portal publik
 * Terintegrasi auto-translate dengan caching Vercel
 */
export async function getPublikPaslonList(lang = 'id') {
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
            visi,
            misi
          )
        )
      `)
      .order('nomor_urut', { ascending: true });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    let resultData = data || [];

    if (lang && lang !== 'id' && resultData.length > 0) {
      resultData = await Promise.all(
        resultData.map(async (paslon) => {
          let updatedPaslon = { ...paslon };

          // Translate slogan
          if (paslon.slogan) {
            const transSlogan = await getCachedTranslation(
              paslon.slogan,
              lang,
              `paslon-slogan-${paslon.id}`
            );
            updatedPaslon.slogan = transSlogan || paslon.slogan;
          }

          // Translate visi & misi kandidat 1 jika ada
          if (paslon.kandidat1?.detail_kandidat) {
            const d1 = paslon.kandidat1.detail_kandidat;
            const trans1 = await getCachedTranslation(
              { visi: d1.visi, misi: d1.misi },
              lang,
              `k1-${paslon.kandidat1.id}`
            );
            updatedPaslon.kandidat1 = {
              ...paslon.kandidat1,
              detail_kandidat: {
                ...d1,
                visi: trans1?.visi || d1.visi,
                misi: trans1?.misi || d1.misi,
              },
            };
          }

          // Translate visi & misi kandidat 2 jika ada
          if (paslon.kandidat2?.detail_kandidat) {
            const d2 = paslon.kandidat2.detail_kandidat;
            const trans2 = await getCachedTranslation(
              { visi: d2.visi, misi: d2.misi },
              lang,
              `k2-${paslon.kandidat2.id}`
            );
            updatedPaslon.kandidat2 = {
              ...paslon.kandidat2,
              detail_kandidat: {
                ...d2,
                visi: trans2?.visi || d2.visi,
                misi: trans2?.misi || d2.misi,
              },
            };
          }

          return updatedPaslon;
        })
      );
    }

    return { success: true, data: resultData };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
