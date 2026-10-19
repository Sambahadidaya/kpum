'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { setPanitiaSession } from '@/utils/supabaseUtils';
import { sanitizeText } from '@/scurity/sanitaze';
import { checkRateLimit } from '@/scurity/rateLimiter';
import { headers } from 'next/headers';

/**
 * Server Action: Login Panitia menggunakan NIM dan Password
 * @param {string} nim
 * @param {string} password
 */
export async function loginPanitia(nim, password) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Rate limit: Maksimal 5 percobaan gagal per 5 menit
    const allowed = checkRateLimit(`login_${clientIp}`, 5, 5 * 60 * 1000);
    if (!allowed) {
      return {
        success: false,
        error: 'Terlalu banyak percobaan login gagal. Mohon tunggu 5 menit.',
      };
    }

    const cleanNim = sanitizeText(nim || '');
    if (!cleanNim || !password) {
      return { success: false, error: 'NIM dan Password wajib diisi.' };
    }

    // 1. Cari data admin berdasarkan NIM di tabel adminpanitia
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('adminpanitia')
      .select('id, auth_id, nama, nim, email, role_id, roleadmin (id, role, roleakses)')
      .eq('nim', cleanNim)
      .single();

    if (adminError || !admin) {
      return { success: false, error: 'NIM tidak terdaftar sebagai panitia KPU.' };
    }

    // 2. Lakukan autentikasi menggunakan email & password ke Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: admin.email,
      password: password,
    });

    if (authError || !authData.user) {
      return { success: false, error: 'Password salah. Silakan periksa kembali.' };
    }

    // 3. Update status online = true & update_at (terakhir login)
    try {
      await supabaseAdmin
        .from('adminpanitia')
        .update({
          is_online: true,
          update_at: new Date().toISOString(),
        })
        .eq('id', admin.id);
    } catch (e) {
      console.error('Failed to set online status and login time on login:', e);
    }

    // 4. Simpan session terenkripsi ke cookie HTTP-only
    await setPanitiaSession(admin, authData.user.id);

    return {
      success: true,
      message: 'Login berhasil!',
      role: admin.roleadmin?.role || 'adminPanitia',
      nama: admin.nama,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat proses login.',
    };
  }
}
