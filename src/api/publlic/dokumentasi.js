'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { getCachedTranslation } from '@/api/publlic/dynamicTranslate';

/**
 * Server Action: Mengambil data dokumentasi kegiatan KPU untuk portal publik
 * Terintegrasi auto-translate dengan caching Vercel
 */
export async function getPublikDokumentasi(lang = 'id') {
  try {
    const { data, error } = await supabaseAdmin
      .from('dukomentasi')
      .select('id, judul_dokumentasi, tanggal_dokumentasi, link_drive, deskripsi')
      .order('tanggal_dokumentasi', { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    let resultData = data || [];

    if (lang && lang !== 'id' && resultData.length > 0) {
      resultData = await Promise.all(
        resultData.map(async (doc) => {
          const toTranslate = {
            judul_dokumentasi: doc.judul_dokumentasi,
            deskripsi: doc.deskripsi,
          };

          const res = await getCachedTranslation(
            toTranslate,
            lang,
            `dokumentasi-${doc.id}`
          );

          return {
            ...doc,
            judul_dokumentasi: res?.judul_dokumentasi || doc.judul_dokumentasi,
            deskripsi: res?.deskripsi || doc.deskripsi,
          };
        })
      );
    }

    return { success: true, data: resultData };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
