'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';
import { sanitizeText } from '@/scurity/sanitaze';

/**
 * Mengambil daftar seluruh jadwal acara pemilu
 */
export async function getPanitiaJadwalList() {
  try {
    await requirePanitiaPermission('dokumentasi');

    const { data, error } = await supabaseAdmin
      .from('jadwal_acara')
      .select('id, judul_acara, tanggal_mulai, tanggal_selesai, lokasi, deskripsi, status, created_at')
      .order('tanggal_mulai', { ascending: true });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Simpan atau Perbarui Jadwal Acara
 */
export async function simpanJadwalAcara(payload) {
  try {
    await requirePanitiaPermission('dokumentasi');

    const id = payload.id;
    const judul = sanitizeText(payload.judul_acara || '');
    const lokasi = sanitizeText(payload.lokasi || '');
    const deskripsi = sanitizeText(payload.deskripsi || '');
    const status = payload.status || 'akan_datang';
    const tanggalMulai = payload.tanggal_mulai || null;
    const tanggalSelesai = payload.tanggal_selesai || null;

    if (!judul) {
      return { success: false, error: 'Judul acara wajib diisi.' };
    }

    if (id) {
      // Update
      const { error } = await supabaseAdmin
        .from('jadwal_acara')
        .update({
          judul_acara: judul,
          lokasi: lokasi,
          deskripsi: deskripsi,
          status: status,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
    } else {
      // Tambah baru
      const { error } = await supabaseAdmin
        .from('jadwal_acara')
        .insert({
          judul_acara: judul,
          lokasi: lokasi,
          deskripsi: deskripsi,
          status: status,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
        });

      if (error) return { success: false, error: error.message };
    }

    return { success: true, message: 'Jadwal acara berhasil disimpan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Jadwal Acara
 */
export async function hapusJadwalAcara(id) {
  try {
    await requirePanitiaPermission('dokumentasi');

    if (!id) return { success: false, error: 'ID jadwal tidak valid.' };

    const { error } = await supabaseAdmin
      .from('jadwal_acara')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Jadwal acara berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
