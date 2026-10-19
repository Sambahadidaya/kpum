'use server';

import { getPanitiaSession, removePanitiaSession } from '@/utils/supabaseUtils';
import { supabaseAdmin } from '@/lib/supabase';

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
 * Server Action: Update status online admin panitia
 */
export async function updateAdminOnlineStatus(isOnline) {
  try {
    const session = await getPanitiaSession();
    if (!session?.adminId) {
      return { success: false, error: 'Tidak ada sesi admin aktif' };
    }

    const { error } = await supabaseAdmin
      .from('adminpanitia')
      .update({ is_online: Boolean(isOnline) })
      .eq('id', session.adminId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, is_online: Boolean(isOnline) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Logout sesi panitia
 */
export async function logoutPanitia() {
  try {
    const session = await getPanitiaSession();
    if (session?.adminId) {
      await supabaseAdmin
        .from('adminpanitia')
        .update({ is_online: false })
        .eq('id', session.adminId);
    }
    await removePanitiaSession();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

