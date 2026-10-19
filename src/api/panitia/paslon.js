'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';
import { sanitizeText } from '@/scurity/sanitaze';

/**
 * Mengambil seluruh data paslon beserta data kedua kandidatnya
 */
export async function getPanitiaPaslonList() {
  try {
    await requirePanitiaPermission('kandidat');

    const [paslonRes, kandidatRes] = await Promise.all([
      supabaseAdmin
        .from('paslon')
        .select(`
          id,
          nomor_urut,
          slogan,
          kandidat1_id,
          kandidat2_id,
          created_at,
          kandidat1:kandidat1_id (
            id,
            nama_kandidat,
            nim_kandidat,
            prodi_kandidat,
            fotodiri_kandidat,
            posisi,
            is_eliminated,
            detail_kandidat (visi, misi)
          ),
          kandidat2:kandidat2_id (
            id,
            nama_kandidat,
            nim_kandidat,
            prodi_kandidat,
            fotodiri_kandidat,
            posisi,
            is_eliminated,
            detail_kandidat (visi, misi)
          )
        `)
        .order('nomor_urut', { ascending: true }),
      supabaseAdmin
        .from('kandidat')
        .select('id, nama_kandidat, nim_kandidat, prodi_kandidat, fotodiri_kandidat, posisi, is_eliminated')
        .order('nama_kandidat', { ascending: true }),
    ]);

    if (paslonRes.error) {
      return { success: false, data: [], kandidatOptions: [], error: paslonRes.error.message };
    }

    return {
      success: true,
      data: paslonRes.data || [],
      kandidatOptions: kandidatRes.data || [],
    };
  } catch (error) {
    return { success: false, data: [], kandidatOptions: [], error: error.message };
  }
}

/**
 * Simpan atau Perbarui Paslon
 */
export async function simpanPaslon(payload) {
  try {
    await requirePanitiaPermission('kandidat');

    const id = payload.id;
    const nomorUrut = parseInt(payload.nomor_urut, 10);
    const kandidat1Id = payload.kandidat1_id;
    const kandidat2Id = payload.kandidat2_id || null;
    const slogan = sanitizeText(payload.slogan || '');

    if (isNaN(nomorUrut) || nomorUrut < 1) {
      return { success: false, error: 'Nomor urut harus berupa angka minimal 1.' };
    }

    if (!kandidat1Id) {
      return { success: false, error: 'Kandidat 1 (Calon Presiden) wajib dipilih.' };
    }

    if (kandidat1Id === kandidat2Id) {
      return { success: false, error: 'Kandidat 1 dan Kandidat 2 tidak boleh orang yang sama.' };
    }

    if (id) {
      // Update
      const { error } = await supabaseAdmin
        .from('paslon')
        .update({
          nomor_urut: nomorUrut,
          kandidat1_id: kandidat1Id,
          kandidat2_id: kandidat2Id,
          slogan: slogan,
        })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
    } else {
      // Tambah baru
      const { error } = await supabaseAdmin
        .from('paslon')
        .insert({
          nomor_urut: nomorUrut,
          kandidat1_id: kandidat1Id,
          kandidat2_id: kandidat2Id,
          slogan: slogan,
        });

      if (error) return { success: false, error: error.message };
    }

    return { success: true, message: 'Data paslon berhasil disimpan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Paslon
 */
export async function hapusPaslon(id) {
  try {
    await requirePanitiaPermission('kandidat');

    if (!id) return { success: false, error: 'ID paslon tidak valid.' };

    const { error } = await supabaseAdmin
      .from('paslon')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Paslon berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
