'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { getCachedTranslation } from '@/api/publlic/dynamicTranslate';

/**
 * Server Action: Mengambil data seluruh kandidat untuk portal publik
 * Mendukung auto-translate cerdas dengan Vercel Data Cache jika bahasa !== 'id'
 */
export async function getPublikKandidat(lang = 'id') {
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

    let resultData = data || [];

    // Jika bahasa yang diminta bukan Indonesia, lakukan translate & caching Vercel
    if (lang && lang !== 'id' && resultData.length > 0) {
      resultData = await Promise.all(
        resultData.map(async (k) => {
          const detail = k.detail_kandidat;
          if (!detail) return k;

          const toTranslate = {
            posisi: k.posisi,
            visi: detail.visi,
            misi: detail.misi,
          };

          const translated = await getCachedTranslation(
            toTranslate,
            lang,
            `kandidat-${k.id}`
          );

          return {
            ...k,
            posisi: translated?.posisi || k.posisi,
            detail_kandidat: {
              ...detail,
              visi: translated?.visi || detail.visi,
              misi: translated?.misi || detail.misi,
            },
          };
        })
      );
    }

    return { success: true, data: resultData };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Server Action: Mengambil data pasangan calon (paslon) untuk portal publik
 */
export async function getPublikPaslon(lang = 'id') {
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

    let resultData = data || [];

    if (lang && lang !== 'id' && resultData.length > 0) {
      resultData = await Promise.all(
        resultData.map(async (p) => {
          if (!p.slogan) return p;

          const translatedSlogan = await getCachedTranslation(
            p.slogan,
            lang,
            `paslon-slogan-${p.id}`
          );

          return {
            ...p,
            slogan: translatedSlogan || p.slogan,
          };
        })
      );
    }

    return { success: true, data: resultData };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
