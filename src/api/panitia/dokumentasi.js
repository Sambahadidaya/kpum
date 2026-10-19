'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';
import { sanitizeText, sanitizeUrl } from '@/scurity/sanitaze';

/**
 * Mengambil seluruh data dokumentasi untuk panel panitia
 */
export async function getPanitiaDokumentasiList() {
  try {
    await requirePanitiaPermission('dokumentasi');

    const { data, error } = await supabaseAdmin
      .from('dukomentasi')
      .select('id, judul_dokumentasi, tanggal_dokumentasi, link_drive, deskripsi, created_at')
      .order('tanggal_dokumentasi', { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Simpan atau Update Dokumentasi
 */
export async function simpanDokumentasi(payload) {
  try {
    await requirePanitiaPermission('dokumentasi');

    const id = payload.id;
    const judul = sanitizeText(payload.judul_dokumentasi || '');
    const tanggal = payload.tanggal_dokumentasi || new Date().toISOString().split('T')[0];
    const linkDrive = sanitizeUrl(payload.link_drive || '');
    const deskripsi = sanitizeText(payload.deskripsi || '');

    if (!judul || !linkDrive) {
      return { success: false, error: 'Judul Dokumentasi dan Link Google Drive wajib diisi.' };
    }

    if (id) {
      const { error } = await supabaseAdmin.from('dukomentasi').update({
        judul_dokumentasi: judul,
        tanggal_dokumentasi: tanggal,
        link_drive: linkDrive,
        deskripsi: deskripsi,
        update_at: new Date().toISOString(),
      }).eq('id', id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabaseAdmin.from('dukomentasi').insert({
        judul_dokumentasi: judul,
        tanggal_dokumentasi: tanggal,
        link_drive: linkDrive,
        deskripsi: deskripsi,
      });

      if (error) return { success: false, error: error.message };
    }

    return { success: true, message: 'Data dokumentasi berhasil disimpan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Dokumentasi
 */
export async function hapusDokumentasi(id) {
  try {
    await requirePanitiaPermission('dokumentasi');
    if (!id) return { success: false, error: 'ID tidak valid.' };

    const { error } = await supabaseAdmin.from('dukomentasi').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Dokumentasi berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
