'use server';

import { supabasePublic } from '@/lib/supabase';
import { KPU_FAQ_DATA } from '@/data/faqDataAi';
import { getCachedTranslation } from '@/api/publlic/dynamicTranslate';

/**
 * Mengambil daftar FAQ aktif untuk Sams Asisten AI di halaman publik
 * Otomatis diterjemahkan sesuai bahasa yang dipilih (misal: 'en', 'ar', dll.)
 *
 * @param {string} lang Kode bahasa target (default: 'id')
 */
export async function getPublicAiFaq(lang = 'id') {
  try {
    const { data, error } = await supabasePublic
      .from('ai_faq')
      .select('id, kategori, pertanyaan, jawaban, urutan')
      .eq('is_active', true)
      .order('urutan', { ascending: true });

    let faqList = (!error && data && data.length > 0) ? data : KPU_FAQ_DATA;

    // Jika bahasa bukan 'id', terjemahkan field kategori, pertanyaan, dan jawaban
    if (lang && lang !== 'id' && faqList.length > 0) {
      faqList = await Promise.all(
        faqList.map(async (item, idx) => {
          const itemKey = item.id || `faq-item-${idx}`;
          const toTranslate = {
            kategori: item.kategori,
            pertanyaan: item.pertanyaan,
            jawaban: item.jawaban,
          };

          const translated = await getCachedTranslation(
            toTranslate,
            lang,
            `faq-${itemKey}`
          );

          return {
            ...item,
            kategori: translated?.kategori || item.kategori,
            pertanyaan: translated?.pertanyaan || item.pertanyaan,
            jawaban: translated?.jawaban || item.jawaban,
          };
        })
      );
    }

    return { success: true, data: faqList };
  } catch (err) {
    console.error('[getPublicAiFaq] error:', err);
    return { success: true, data: KPU_FAQ_DATA, fromFallback: true };
  }
}

