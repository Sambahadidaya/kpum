'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';

/**
 * Mengambil data log trafik dengan filter tanggal dan paginasi
 */
export async function getPanitiaTrafikData(filterDate = null, page = 1, limit = 50) {
  try {
    await requirePanitiaPermission('dashboard');

    const offset = (page - 1) * limit;
    let query = supabaseAdmin
      .from('trafik')
      .select('id, ip_address, isp, kota, negara, sumber, referrer, path, user_agent, visited_at', { count: 'exact' });

    if (filterDate) {
      const startOfDay = `${filterDate}T00:00:00.000Z`;
      const endOfDay = `${filterDate}T23:59:59.999Z`;
      query = query.gte('visited_at', startOfDay).lte('visited_at', endOfDay);
    }

    const { data, count, error } = await query
      .order('visited_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return { success: false, data: [], total: 0, error: error.message };
    }

    // Ambil setting auto-delete saat ini
    const { data: settingData } = await supabaseAdmin
      .from('trafik_setting')
      .select('id, auto_delete_enabled, interval_hari, updated_at')
      .limit(1)
      .maybeSingle();

    return {
      success: true,
      data: data || [],
      total: count || 0,
      setting: settingData || { auto_delete_enabled: false, interval_hari: 7 },
    };
  } catch (error) {
    return { success: false, data: [], total: 0, error: error.message };
  }
}

/**
 * Hapus seluruh data trafik (Format/Reset Total)
 */
export async function hapusSemuaTrafik() {
  try {
    await requirePanitiaPermission('dashboard');

    // Hapus seluruh baris (id not null)
    const { error } = await supabaseAdmin
      .from('trafik')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Seluruh riwayat trafik berhasil dibersihkan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus data log trafik pada satu tanggal tertentu (YYYY-MM-DD)
 */
export async function hapusTrafikPerTanggal(targetDate) {
  try {
    await requirePanitiaPermission('dashboard');

    if (!targetDate) return { success: false, error: 'Tanggal wajib ditentukan.' };

    const start = `${targetDate}T00:00:00.000Z`;
    const end = `${targetDate}T23:59:59.999Z`;

    const { error } = await supabaseAdmin
      .from('trafik')
      .delete()
      .gte('visited_at', start)
      .lte('visited_at', end);

    if (error) return { success: false, error: error.message };

    return { success: true, message: `Data trafik pada tanggal ${targetDate} berhasil dihapus.` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus data trafik yang lebih lama dari N hari yang lalu
 */
export async function hapusTrafikLebihLamaDari(intervalHari) {
  try {
    await requirePanitiaPermission('dashboard');

    const days = parseInt(intervalHari, 10);
    if (isNaN(days) || days < 1) {
      return { success: false, error: 'Interval hari minimal 1.' };
    }

    const batasWaktu = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from('trafik')
      .delete()
      .lt('visited_at', batasWaktu);

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      message: `Data trafik yang lebih lama dari ${days} hari berhasil dibersihkan.`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Simpan pengaturan auto-delete trafik
 */
export async function simpanTrafikSetting(autoDeleteEnabled, intervalHari) {
  try {
    await requirePanitiaPermission('dashboard');

    const enabled = Boolean(autoDeleteEnabled);
    const interval = parseInt(intervalHari, 10) || 7;

    const { data: existing } = await supabaseAdmin
      .from('trafik_setting')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await supabaseAdmin
        .from('trafik_setting')
        .update({
          auto_delete_enabled: enabled,
          interval_hari: interval,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('trafik_setting')
        .insert({
          auto_delete_enabled: enabled,
          interval_hari: interval,
        });
    }

    // Jika diaktifkan, jalankan pembersihan data yang melebihi interval saat itu juga
    if (enabled && interval > 0) {
      const batasWaktu = new Date(Date.now() - interval * 24 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from('trafik')
        .delete()
        .lt('visited_at', batasWaktu);
    }

    return {
      success: true,
      message: 'Pengaturan pembersihan otomatis trafik berhasil disimpan.',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
