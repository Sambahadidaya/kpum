'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/scurity/sanitaze';

/**
 * Mengambil seluruh daftar admin panitia (Khusus SuperAdmin)
 */
export async function getPanitiaAdminList() {
  try {
    const session = await requirePanitiaPermission('akun');

    const [adminRes, roleRes] = await Promise.all([
      supabaseAdmin
        .from('adminpanitia')
        .select(`
          id,
          auth_id,
          nama,
          nim,
          email,
          no_tlpn,
          role_id,
          created_at,
          roleadmin (id, role, roleakses)
        `)
        .order('created_at', { ascending: true }),
      supabaseAdmin
        .from('roleadmin')
        .select('id, role, roleakses')
        .order('role', { ascending: true }),
    ]);

    if (adminRes.error) return { success: false, data: [], error: adminRes.error.message };

    return {
      success: true,
      data: adminRes.data || [],
      roles: roleRes.data || [],
      currentAdmin: session,
    };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

export const getAdminPanitiaList = getPanitiaAdminList;

/**
 * Mengambil daftar role yang tersedia
 */
export async function getRoleList() {
  try {
    await requirePanitiaPermission('akun');

    const { data, error } = await supabaseAdmin
      .from('roleadmin')
      .select('id, role, roleakses')
      .order('role', { ascending: true });

    if (error) return { success: false, data: [], error: error.message };

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Membuat Akun Admin Panitia Baru (SuperAdmin Only)
 */
export async function tambahAdminPanitia(payload) {
  try {
    await requirePanitiaPermission('akun');

    const nama = sanitizeText(payload.nama || '');
    const nim = sanitizeText(payload.nim || '');
    const email = sanitizeEmail(payload.email || '');
    const noTlpn = sanitizePhone(payload.no_tlpn || '');
    const roleId = payload.role_id;
    const password = payload.password || '';

    if (!nama || !nim || !email || !password || !roleId) {
      return { success: false, error: 'Semua field wajib diisi (Nama, NIM, Email, Password, Role).' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password minimal 6 karakter.' };
    }

    // 1. Buat user di Supabase Auth melalui Supabase Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { nama, nim },
    });

    if (authError || !authUser?.user) {
      return { success: false, error: 'Gagal membuat user auth: ' + (authError?.message || 'Error') };
    }

    // 2. Simpan profil ke tabel adminpanitia
    const { error: insertError } = await supabaseAdmin.from('adminpanitia').insert({
      auth_id: authUser.user.id,
      role_id: roleId,
      nama: nama,
      nim: nim,
      email: email,
      no_tlpn: noTlpn,
    });

    if (insertError) {
      // Rollback user auth jika gagal insert profil
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: 'Gagal menyimpan profil admin: ' + insertError.message };
    }

    return { success: true, message: 'Akun admin panitia berhasil dibuat.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Menghapus akun admin panitia
 */
export async function hapusAdminPanitia(adminId, authId) {
  try {
    const session = await requirePanitiaPermission('akun');

    // Cegah menghapus akun sendiri
    if (session.adminId === adminId) {
      return { success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' };
    }

    // Hapus dari Supabase Auth (cascade ke adminpanitia)
    if (authId) {
      await supabaseAdmin.auth.admin.deleteUser(authId);
    } else {
      await supabaseAdmin.from('adminpanitia').delete().eq('id', adminId);
    }

    return { success: true, message: 'Akun admin berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export const buatAkunPanitia = tambahAdminPanitia;
export const hapusAkunPanitia = hapusAdminPanitia;
