'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';

/**
 * Mengambil daftar pesan kontak masuk
 */
export async function getPanitiaKontakList() {
  try {
    await requirePanitiaPermission('contact');

    const { data, error } = await supabaseAdmin
      .from('kontak')
      .select('id, nama, email_or_notelp, jenis_kontak, pesan_kontak, status, created_at')
      .order('created_at', { ascending: false });

    if (error) return { success: false, data: [], error: error.message };

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Update Status Pesan (sudah_dibaca / dibalas / belum_dibaca)
 */
export async function updateStatusKontak(id, status) {
  try {
    await requirePanitiaPermission('contact');

    const { error } = await supabaseAdmin
      .from('kontak')
      .update({ status })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Pesan Kontak
 */
export async function hapusKontak(id) {
  try {
    await requirePanitiaPermission('contact');

    const { error } = await supabaseAdmin
      .from('kontak')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Pesan berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export const getPanitiaContactList = getPanitiaKontakList;
export const hapusPesanKontak = hapusKontak;
