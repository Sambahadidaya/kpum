'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { getCachedTranslation } from '@/api/publlic/dynamicTranslate';

/**
 * Server Action: Mengambil data seluruh struktur panduan beserta sub-judul dan isinya
 * Terintegrasi auto-translate dengan caching Vercel
 */
export async function getPublikPanduan(lang = 'id') {
  try {
    const { data: panduanList, error: pError } = await supabaseAdmin
      .from('panduan')
      .select('id, judul, urutan')
      .order('urutan', { ascending: true });

    if (pError) {
      return { success: false, data: [], error: pError.message };
    }

    const { data: isiList, error: iError } = await supabaseAdmin
      .from('isi_panduan')
      .select('id, judul_panduan_id, sub_judul, isi, link_vidio, urutan')
      .order('urutan', { ascending: true });

    if (iError) {
      return { success: false, data: [], error: iError.message };
    }

    // Gabungkan isi_panduan ke dalam masing-masing judul panduan
    let structuredPanduan = (panduanList || []).map((p) => {
      const items = (isiList || []).filter((item) => item.judul_panduan_id === p.id);
      return {
        ...p,
        items,
      };
    });

    // Jika bahasa bukan 'id', terjemahkan judul dan isi lalu cache
    if (lang && lang !== 'id' && structuredPanduan.length > 0) {
      structuredPanduan = await Promise.all(
        structuredPanduan.map(async (p) => {
          const translatedJudul = await getCachedTranslation(
            p.judul,
            lang,
            `panduan-judul-${p.id}`
          );

          const translatedItems = await Promise.all(
            p.items.map(async (item) => {
              const toTranslate = {
                sub_judul: item.sub_judul,
                isi: item.isi,
              };

              const res = await getCachedTranslation(
                toTranslate,
                lang,
                `panduan-item-${item.id}`
              );

              return {
                ...item,
                sub_judul: res?.sub_judul || item.sub_judul,
                isi: res?.isi || item.isi,
              };
            })
          );

          return {
            ...p,
            judul: translatedJudul || p.judul,
            items: translatedItems,
          };
        })
      );
    }

    return { success: true, data: structuredPanduan };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
