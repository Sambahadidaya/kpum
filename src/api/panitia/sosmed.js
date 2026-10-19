// src/api/panitia/sosmed.js
'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';

/**
 * Server Action: Retrieve aggregated social media traffic counts.
 * Optional date range filter (ISO strings) can be provided.
 * Returns: { success: boolean, data: [{ platform: string, count: number }], error?: string }
 */
export async function getSosmedTrafikData({ startDate = null, endDate = null } = {}) {
  try {
    // Verify user has access to dashboard area (or appropriate permission)
    await requirePanitiaPermission('dashboard');

    let query = supabaseAdmin.from('trafik_sosmed').select('platform, created_at');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;
    if (error) {
      return { success: false, data: [], error: error.message };
    }

    const platformMap = {};
    (data || []).forEach((row) => {
      const platform = (row.platform || 'unknown').toLowerCase();
      platformMap[platform] = (platformMap[platform] || 0) + 1;
    });

    const aggregated = Object.entries(platformMap).map(([platform, count]) => ({ platform, count }));
    return { success: true, data: aggregated };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
}
