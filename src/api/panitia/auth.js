'use server';

import { getPanitiaSession, removePanitiaSession } from '@/utils/supabaseUtils';

/**
 * Server Action: Mengambil informasi sesi aktif admin panitia
 */
export async function getSesiPanitia() {
  try {
    const session = await getPanitiaSession();
    if (!session) {
      return { authenticated: false, session: null };
    }
    return {
      authenticated: true,
      session: {
        adminId: session.adminId,
        nama: session.nama,
        nim: session.nim,
        email: session.email,
        role: session.role,
        roleAkses: session.roleAkses,
      },
    };
  } catch (error) {
    return { authenticated: false, session: null, error: error.message };
  }
}

/**
 * Server Action: Logout sesi panitia
 */
export async function logoutPanitia() {
  try {
    await removePanitiaSession();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
