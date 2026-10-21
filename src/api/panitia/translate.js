'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission, requirePanitiaEditor } from '@/utils/supabaseUtils';
import { sanitizeText } from '@/scurity/sanitaze';

/**
 * Mengambil seluruh daftar bahasa sistem
 */
export async function getLanguagesList() {
  try {
    await requirePanitiaPermission('translate');

    const { data: languages, error: lError } = await supabaseAdmin
      .from('site_language')
      .select('kode, nama, flag, is_active, urutan, created_at')
      .order('urutan', { ascending: true });

    if (lError) return { success: false, error: lError.message, data: [] };

    // Ambil hitungan string terjemahan per bahasa untuk statistik badge
    const { data: counts, error: cError } = await supabaseAdmin
      .from('site_translation')
      .select('kode');

    const countMap = {};
    if (!cError && counts) {
      counts.forEach((item) => {
        countMap[item.kode] = (countMap[item.kode] || 0) + 1;
      });
    }

    const enhanced = (languages || []).map((lang) => ({
      ...lang,
      translationCount: countMap[lang.kode] || 0,
    }));

    return { success: true, data: enhanced };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Menambahkan bahasa baru ke site_language
 */
export async function addLanguage(payload) {
  try {
    await requirePanitiaEditor('translate');

    const cleanKode = (payload.kode || '').trim().toLowerCase().slice(0, 5);
    const cleanNama = sanitizeText(payload.nama || '');
    const cleanFlag = (payload.flag || '🌐').trim().slice(0, 10);
    const urutan = Number(payload.urutan) || 1;
    const isActive = payload.is_active !== undefined ? Boolean(payload.is_active) : true;

    if (!cleanKode || !cleanNama) {
      return { success: false, error: 'Kode bahasa (ISO) dan nama bahasa wajib diisi.' };
    }

    const { data, error } = await supabaseAdmin
      .from('site_language')
      .insert({
        kode: cleanKode,
        nama: cleanNama,
        flag: cleanFlag,
        urutan,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Opsional: otomatis salin string dari bahasa Indonesia jika diaktifkan
    if (payload.copyFromId) {
      await copyTranslationsFromIndonesian(cleanKode);
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Memperbarui data bahasa di site_language
 */
export async function updateLanguage(kode, payload) {
  try {
    await requirePanitiaEditor('translate');

    const cleanNama = sanitizeText(payload.nama || '');
    const cleanFlag = (payload.flag || '🌐').trim().slice(0, 10);
    const urutan = Number(payload.urutan) || 1;
    const isActive = payload.is_active !== undefined ? Boolean(payload.is_active) : true;

    if (!cleanNama) {
      return { success: false, error: 'Nama bahasa tidak boleh kosong.' };
    }

    const { data, error } = await supabaseAdmin
      .from('site_language')
      .update({
        nama: cleanNama,
        flag: cleanFlag,
        urutan,
        is_active: isActive,
      })
      .eq('kode', kode)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle status aktif bahasa
 */
export async function toggleLanguageActive(kode, isActive) {
  try {
    await requirePanitiaEditor('translate');

    if (kode === 'id' && !isActive) {
      return { success: false, error: 'Bahasa Indonesia adalah bahasa default dan tidak dapat dinonaktifkan.' };
    }

    const { error } = await supabaseAdmin
      .from('site_language')
      .update({ is_active: Boolean(isActive) })
      .eq('kode', kode);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus bahasa (cascade hapus terjemahan terkait)
 */
export async function deleteLanguage(kode) {
  try {
    await requirePanitiaEditor('translate');

    if (kode === 'id') {
      return { success: false, error: 'Bahasa Indonesia adalah bahasa default dan tidak dapat dihapus.' };
    }

    const { error } = await supabaseAdmin
      .from('site_language')
      .delete()
      .eq('kode', kode);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Mengambil seluruh daftar key-value terjemahan untuk satu bahasa tertentu
 */
export async function getTranslationsByLanguage(kode) {
  try {
    await requirePanitiaPermission('translate');

    const cleanKode = (kode || 'id').trim().toLowerCase();

    // Ambil semua entri terjemahan untuk kode bahasa tersebut
    const { data: currentTrans, error: cError } = await supabaseAdmin
      .from('site_translation')
      .select('kode, key_teks, value_teks, updated_at')
      .eq('kode', cleanKode);

    if (cError) return { success: false, error: cError.message, data: [] };

    // Ambil juga referensi bahasa Indonesia (ID) sebagai acuan label asli
    let idReferenceMap = {};
    if (cleanKode !== 'id') {
      const { data: idTrans } = await supabaseAdmin
        .from('site_translation')
        .select('key_teks, value_teks')
        .eq('kode', 'id');

      if (idTrans) {
        idTrans.forEach((t) => {
          idReferenceMap[t.key_teks] = t.value_teks;
        });
      }
    }

    const transMap = {};
    (currentTrans || []).forEach((t) => {
      transMap[t.key_teks] = t;
    });

    // Gabungkan dengan key ID yang belum ada di bahasa target agar user tahu ada teks yang belum diterjemahkan
    const allKeys = new Set([
      ...Object.keys(transMap),
      ...Object.keys(idReferenceMap),
    ]);

    const result = Array.from(allKeys).map((key) => {
      const existing = transMap[key];
      return {
        key_teks: key,
        value_teks: existing ? existing.value_teks : '',
        id_reference: idReferenceMap[key] || existing?.value_teks || '',
        updated_at: existing ? existing.updated_at : null,
        is_missing: !existing || !existing.value_teks,
      };
    });

    // Urutkan alfabetis berdasarkan key
    result.sort((a, b) => a.key_teks.localeCompare(b.key_teks));

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Menyimpan / memperbarui satu key terjemahan
 */
export async function upsertTranslation(kode, keyTeks, valueTeks) {
  try {
    await requirePanitiaEditor('translate');

    const cleanKode = (kode || '').trim().toLowerCase();
    const cleanKey = (keyTeks || '').trim().toLowerCase();
    const cleanVal = typeof valueTeks === 'string' ? valueTeks.trim() : '';

    if (!cleanKode || !cleanKey) {
      return { success: false, error: 'Kode bahasa dan key teks wajib diisi.' };
    }

    const { data, error } = await supabaseAdmin
      .from('site_translation')
      .upsert(
        {
          kode: cleanKode,
          key_teks: cleanKey,
          value_teks: cleanVal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'kode,key_teks' }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menyimpan banyak terjemahan sekaligus (Bulk Save)
 * @param {string} kode Kode bahasa
 * @param {Array<{key_teks: string, value_teks: string}>} entries
 */
export async function bulkSaveTranslations(kode, entries = []) {
  try {
    await requirePanitiaEditor('translate');

    const cleanKode = (kode || '').trim().toLowerCase();
    if (!cleanKode) return { success: false, error: 'Kode bahasa tidak valid.' };

    const records = entries
      .filter((e) => e && e.key_teks)
      .map((e) => ({
        kode: cleanKode,
        key_teks: e.key_teks.trim().toLowerCase(),
        value_teks: typeof e.value_teks === 'string' ? e.value_teks.trim() : '',
        updated_at: new Date().toISOString(),
      }));

    if (records.length === 0) {
      return { success: true, count: 0 };
    }

    const { error } = await supabaseAdmin
      .from('site_translation')
      .upsert(records, { onConflict: 'kode,key_teks' });

    if (error) return { success: false, error: error.message };
    return { success: true, count: records.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus satu key terjemahan
 */
export async function deleteTranslation(kode, keyTeks) {
  try {
    await requirePanitiaEditor('translate');

    const { error } = await supabaseAdmin
      .from('site_translation')
      .delete()
      .eq('kode', kode)
      .eq('key_teks', keyTeks);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menyalin seluruh string teks dari Bahasa Indonesia (ID) ke bahasa target yang belum memiliki terjemahan
 */
export async function copyTranslationsFromIndonesian(targetKode) {
  try {
    await requirePanitiaEditor('translate');

    const cleanTarget = (targetKode || '').trim().toLowerCase();
    if (!cleanTarget || cleanTarget === 'id') {
      return { success: false, error: 'Target bahasa tidak valid atau merupakan bahasa ID itu sendiri.' };
    }

    // Ambil semua string bahasa Indonesia
    const { data: idEntries, error: idError } = await supabaseAdmin
      .from('site_translation')
      .select('key_teks, value_teks')
      .eq('kode', 'id');

    if (idError || !idEntries || idEntries.length === 0) {
      return { success: false, error: 'Data bahasa acuan (Indonesia) kosong.' };
    }

    // Ambil string eksisting target
    const { data: targetEntries } = await supabaseAdmin
      .from('site_translation')
      .select('key_teks')
      .eq('kode', cleanTarget);

    const existingKeys = new Set((targetEntries || []).map((t) => t.key_teks));

    // Siapkan entri yang belum ada
    const toInsert = idEntries
      .filter((e) => !existingKeys.has(e.key_teks))
      .map((e) => ({
        kode: cleanTarget,
        key_teks: e.key_teks,
        value_teks: e.value_teks, // fallback sama dengan teks ID agar bisa diedit panitia
        updated_at: new Date().toISOString(),
      }));

    if (toInsert.length > 0) {
      const { error: insError } = await supabaseAdmin
        .from('site_translation')
        .insert(toInsert);

      if (insError) return { success: false, error: insError.message };
    }

    return { success: true, copiedCount: toInsert.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
