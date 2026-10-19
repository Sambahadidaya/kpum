'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';
import { sanitizeText, sanitizePhone, sanitizeEmail, sanitizeUrl } from '@/scurity/sanitaze';
import { deleteFotoKandidat } from '@/api/storage';

/**
 * Mengambil seluruh data kandidat beserta detailnya untuk panitia
 */
export async function getPanitiaKandidatList() {
  try {
    await requirePanitiaPermission('kandidat');

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
        detail_kandidat_id,
        created_at,
        detail_kandidat (
          id,
          notlpn_wa_kandidat,
          emailplb_kandidat,
          cv_portofolio_kandidat,
          visi,
          misi
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Toggle Status Verifikasi Eliminasi Kandidat (True = Dieliminasi, False = Lolos / Aktif)
 */
export async function toggleEliminasiKandidat(id, isEliminated) {
  try {
    await requirePanitiaPermission('kandidat');

    if (!id) return { success: false, error: 'ID kandidat tidak valid.' };

    const { error } = await supabaseAdmin
      .from('kandidat')
      .update({ is_eliminated: Boolean(isEliminated) })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      message: isEliminated ? 'Kandidat ditandai Dieliminasi.' : 'Kandidat ditandai Lolos/Aktif.',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Tambah atau Perbarui Data Kandidat
 */
export async function simpanKandidat(payload) {
  try {
    await requirePanitiaPermission('kandidat');

    const id = payload.id; // jika ada berarti edit
    const nama = sanitizeText(payload.nama_kandidat || '');
    const nim = sanitizeText(payload.nim_kandidat || '');
    const prodi = sanitizeText(payload.prodi_kandidat || '');
    const posisi = sanitizeText(payload.posisi || 'Calon Presiden Mahasiswa');
    const foto = sanitizeUrl(payload.fotodiri_kandidat || '');

    if (!nama || !nim || !prodi) {
      return { success: false, error: 'Nama, NIM, dan Program Studi wajib diisi.' };
    }

    // Detail kandidat
    const notelp = sanitizePhone(payload.notlpn_wa_kandidat || '');
    const email = sanitizeEmail(payload.emailplb_kandidat || '');
    const cvPorto = sanitizeUrl(payload.cv_portofolio_kandidat || '');
    const visi = sanitizeText(payload.visi || '');
    const misi = sanitizeText(payload.misi || '');

    let detailId = payload.detail_kandidat_id;

    // Simpan / update detail kandidat jika ada info detail
    if (detailId) {
      await supabaseAdmin.from('detail_kandidat').update({
        notlpn_wa_kandidat: notelp,
        emailplb_kandidat: email,
        cv_portofolio_kandidat: cvPorto,
        visi,
        misi,
      }).eq('id', detailId);
    } else if (notelp || email || cvPorto || visi || misi) {
      const { data: detailData } = await supabaseAdmin.from('detail_kandidat').insert({
        notlpn_wa_kandidat: notelp,
        emailplb_kandidat: email,
        cv_portofolio_kandidat: cvPorto,
        visi,
        misi,
      }).select('id').single();

      if (detailData) {
        detailId = detailData.id;
      }
    }

    const isEliminated = Boolean(payload.is_eliminated);

    if (id) {
      // Edit
      const { error } = await supabaseAdmin.from('kandidat').update({
        nama_kandidat: nama,
        nim_kandidat: nim,
        prodi_kandidat: prodi,
        fotodiri_kandidat: foto,
        posisi: posisi,
        is_eliminated: isEliminated,
        detail_kandidat_id: detailId || null,
      }).eq('id', id);

      if (error) return { success: false, error: error.message };
    } else {
      // Tambah baru
      const { error } = await supabaseAdmin.from('kandidat').insert({
        nama_kandidat: nama,
        nim_kandidat: nim,
        prodi_kandidat: prodi,
        fotodiri_kandidat: foto,
        posisi: posisi,
        is_eliminated: isEliminated,
        detail_kandidat_id: detailId || null,
      });

      if (error) return { success: false, error: error.message };
    }

    return { success: true, message: 'Data kandidat berhasil disimpan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Kandidat
 */
export async function hapusKandidat(id, fotoUrl) {
  try {
    await requirePanitiaPermission('kandidat');

    if (!id) return { success: false, error: 'ID kandidat tidak valid.' };

    // Hapus foto di storage bila ada
    if (fotoUrl) {
      await deleteFotoKandidat(fotoUrl);
    }

    const { error } = await supabaseAdmin.from('kandidat').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Kandidat berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
