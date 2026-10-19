'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';
import { sanitizeText } from '@/scurity/sanitaze';

/**
 * Mengambil daftar seluruh role dan aksesnya (SuperAdmin Only)
 */
export async function getPanitiaRoleAksesList() {
  try {
    const session = await requirePanitiaPermission('akun');

    if (session.role !== 'superAdmin') {
      return { success: false, data: [], error: 'Hanya superAdmin yang berhak mengakses pengaturan role.' };
    }

    const { data, error } = await supabaseAdmin
      .from('roleadmin')
      .select('id, role, roleakses, created_at, update_at')
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Simpan atau Update Role Admin (SuperAdmin Only)
 */
export async function simpanRoleAkses(payload) {
  try {
    const session = await requirePanitiaPermission('akun');

    if (session.role !== 'superAdmin') {
      return { success: false, error: 'Akses ditolak: Hanya superAdmin yang berhak mengubah role.' };
    }

    const id = payload.id;
    const roleName = sanitizeText(payload.role || '').trim();
    const roleAkses = sanitizeText(payload.roleakses || payload.roleAkses || '').trim();

    if (!roleName) {
      return { success: false, error: 'Nama role wajib diisi.' };
    }

    if (id) {
      // Update
      const { error } = await supabaseAdmin
        .from('roleadmin')
        .update({
          role: roleName,
          roleakses: roleAkses,
          update_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
    } else {
      // Tambah baru
      const { error } = await supabaseAdmin
        .from('roleadmin')
        .insert({
          role: roleName,
          roleakses: roleAkses,
        });

      if (error) return { success: false, error: error.message };
    }

    return { success: true, message: 'Data role berhasil disimpan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Role Admin (SuperAdmin Only)
 */
export async function hapusRoleAkses(id) {
  try {
    const session = await requirePanitiaPermission('akun');

    if (session.role !== 'superAdmin') {
      return { success: false, error: 'Akses ditolak: Hanya superAdmin yang berhak menghapus role.' };
    }

    if (!id) return { success: false, error: 'ID role tidak valid.' };

    // Cek apakah role sedang digunakan oleh akun admin
    const { count, error: countErr } = await supabaseAdmin
      .from('adminpanitia')
      .select('id', { count: 'exact', head: true })
      .eq('role_id', id);

    if (count && count > 0) {
      return {
        success: false,
        error: `Role tidak dapat dihapus karena masih digunakan oleh ${count} akun panitia.`,
      };
    }

    const { error } = await supabaseAdmin
      .from('roleadmin')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Role berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
