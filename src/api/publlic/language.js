'use server';

import { supabasePublic } from '@/lib/supabase';

/**
 * Mengambil daftar bahasa aktif untuk filter / switch bahasa di portal publik
 */
export async function getPublicActiveLanguages() {
  try {
    const { data, error } = await supabasePublic
      .from('site_language')
      .select('kode, nama, flag, urutan')
      .eq('is_active', true)
      .order('urutan', { ascending: true });

    if (error) {
      return { success: false, data: [] };
    }
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [] };
  }
}

/**
 * Mengambil kamus terjemahan untuk satu bahasa dalam bentuk key-value object map
 * @param {string} kode Kode bahasa (misal: 'id', 'en', 'ar')
 */
export async function getPublicTranslations(kode = 'id') {
  try {
    const cleanKode = (kode || 'id').trim().toLowerCase();

    const { data, error } = await supabasePublic
      .from('site_translation')
      .select('key_teks, value_teks')
      .eq('kode', cleanKode);

    if (error || !data) {
      return { success: false, translations: {} };
    }

    const map = {};
    data.forEach((item) => {
      if (item.key_teks && item.value_teks) {
        map[item.key_teks] = item.value_teks;
      }
    });

    return { success: true, translations: map };
  } catch (err) {
    return { success: false, translations: {} };
  }
}
