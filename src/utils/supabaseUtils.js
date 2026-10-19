import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { hasPermission } from '@/lib/adminRoleData';

const SESSION_COOKIE_NAME = 'kpu_panitia_session';

/**
 * Mengambil session admin panitia dari cookie HTTP-Only server
 */
export async function getPanitiaSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    // Decode session payload
    const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    if (!decoded || !decoded.adminId || !decoded.authId) {
      return null;
    }

    // Cek kadaluwarsa session (7 hari)
    if (decoded.exp && Date.now() > decoded.exp) {
      return null;
    }

    // Verifikasi validitas admin di database
    const { data: admin, error } = await supabaseAdmin
      .from('adminpanitia')
      .select('id, nama, nim, email, no_tlpn, role_id, roleadmin (id, role, roleakses)')
      .eq('id', decoded.adminId)
      .single();

    if (error || !admin) {
      return null;
    }

    return {
      adminId: admin.id,
      authId: decoded.authId,
      nama: admin.nama,
      nim: admin.nim,
      email: admin.email,
      role: admin.roleadmin?.role || 'adminPanitia',
      roleAkses: admin.roleadmin?.roleakses || '',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Menyimpan data session panitia ke dalam HTTP-only Cookie
 */
export async function setPanitiaSession(adminData, authId) {
  const cookieStore = await cookies();
  const sessionPayload = {
    adminId: adminData.id,
    authId: authId,
    nim: adminData.nim,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
  };

  const encoded = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

/**
 * Menghapus cookie session panitia
 */
export async function removePanitiaSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Memastikan user sudah login & punya izin role yang sesuai
 */
export async function requirePanitiaPermission(requiredPermission) {
  const session = await getPanitiaSession();
  if (!session) {
    throw new Error('Akses ditolak: Anda harus login terlebih dahulu.');
  }

  if (requiredPermission && !hasPermission(session.role, requiredPermission, session.roleAkses)) {
    throw new Error('Akses ditolak: Anda tidak memiliki izin untuk tindakan ini.');
  }

  return session;
}
