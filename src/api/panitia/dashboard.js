'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';

/**
 * Server Action: Mengambil data statistik komprehensif untuk Dashboard Panitia
 * Mendukung filter waktu: 'today' | '7days' | '30days' | 'all' | 'custom'
 */
export async function getDashboardStats(filterParams = {}) {
  try {
    await requirePanitiaPermission('dashboard');

    const filter = filterParams.filter || '7days';
    const customStart = filterParams.startDate || null;
    const customEnd = filterParams.endDate || null;

    // 1. Total hitungan data utama
    const [trafikRes, kontakRes, kandidatRes, dokRes] = await Promise.all([
      supabaseAdmin.from('trafik').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('kontak').select('id, status', { count: 'exact' }),
      supabaseAdmin.from('kandidat').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('dukomentasi').select('*', { count: 'exact', head: true }),
    ]);

    const totalTrafik = trafikRes.count || 0;
    const totalKontak = kontakRes.count || 0;
    const pesanBelumDibaca = (kontakRes.data || []).filter((k) => k.status === 'belum_dibaca').length;
    const totalKandidat = kandidatRes.count || 0;
    const totalDokumentasi = dokRes.count || 0;

    // 2. Menghitung rentang waktu berdasarkan filter
    const now = new Date();
    let fromDate = null;
    let toDate = new Date(now);

    if (filter === 'today') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (filter === '30days') {
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      fromDate.setHours(0, 0, 0, 0);
    } else if (filter === 'custom' && customStart) {
      fromDate = new Date(customStart + 'T00:00:00');
      if (customEnd) {
        toDate = new Date(customEnd + 'T23:59:59.999');
      }
    } else if (filter === 'all') {
      fromDate = null;
    } else {
      // Default: 7 hari terakhir
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);
      fromDate.setHours(0, 0, 0, 0);
    }

    // 3. Query data trafik yang terfilter berdasarkan rentang waktu
    let query = supabaseAdmin
      .from('trafik')
      .select('id, sumber, kota, isp, path, visited_at')
      .order('visited_at', { ascending: false });

    if (fromDate) {
      query = query.gte('visited_at', fromDate.toISOString());
    }
    if (toDate) {
      query = query.lte('visited_at', toDate.toISOString());
    }

    const { data: filteredTrafik, error: errTrafik } = await query.limit(500);

    if (errTrafik) {
      throw new Error(errTrafik.message);
    }

    const trafficList = filteredTrafik || [];

    // 4. Membangun data time-series grafik kunjungan (Chart Line)
    const trafficByBucket = {};

    if (filter === 'today') {
      // Kelompokkan per interval 3 jam untuk hari ini (00, 03, 06, 09, 12, 15, 18, 21)
      const hours = [0, 3, 6, 9, 12, 15, 18, 21];
      hours.forEach((h) => {
        const label = `${String(h).padStart(2, '0')}:00`;
        trafficByBucket[label] = 0;
      });

      trafficList.forEach((t) => {
        const d = new Date(t.visited_at);
        const hour = d.getHours();
        // Cari bucket terdekat
        const bucketHour = hours.reduce((prev, curr) => (hour >= curr ? curr : prev), 0);
        const label = `${String(bucketHour).padStart(2, '0')}:00`;
        if (trafficByBucket[label] !== undefined) {
          trafficByBucket[label]++;
        }
      });
    } else if (filter === '30days') {
      // 30 hari ke belakang
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        trafficByBucket[key] = 0;
      }

      trafficList.forEach((t) => {
        const d = new Date(t.visited_at);
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (trafficByBucket[key] !== undefined) {
          trafficByBucket[key]++;
        }
      });
    } else if (filter === 'custom' && fromDate && toDate) {
      // Rentang kustom: hitung selisih hari
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) {
        // Rentang 1-2 hari: kelompokkan per 4 jam
        const hours = [0, 4, 8, 12, 16, 20];
        hours.forEach((h) => {
          trafficByBucket[`${String(h).padStart(2, '0')}:00`] = 0;
        });
        trafficList.forEach((t) => {
          const d = new Date(t.visited_at);
          const h = d.getHours();
          const bucket = hours.reduce((prev, curr) => (h >= curr ? curr : prev), 0);
          const label = `${String(bucket).padStart(2, '0')}:00`;
          if (trafficByBucket[label] !== undefined) trafficByBucket[label]++;
        });
      } else {
        // Kelompokkan per hari
        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
          const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          trafficByBucket[key] = 0;
        }
        trafficList.forEach((t) => {
          const d = new Date(t.visited_at);
          const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (trafficByBucket[key] !== undefined) {
            trafficByBucket[key]++;
          }
        });
      }
    } else {
      // Default: 7 hari
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        trafficByBucket[key] = 0;
      }

      trafficList.forEach((t) => {
        const d = new Date(t.visited_at);
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (trafficByBucket[key] !== undefined) {
          trafficByBucket[key]++;
        }
      });
    }

    // 5. Menghitung Top Sumber Traffic dari data terfilter
    const sourceCounts = {};
    // 6. Menghitung Top Kota dari data terfilter
    const cityCounts = {};

    trafficList.forEach((t) => {
      const s = t.sumber || 'Direct';
      sourceCounts[s] = (sourceCounts[s] || 0) + 1;

      const c = t.kota || 'Lainnya';
      cityCounts[c] = (cityCounts[c] || 0) + 1;
    });

    const topSources = Object.entries(sourceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topCities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      success: true,
      stats: {
        totalTrafik,
        totalKontak,
        pesanBelumDibaca,
        totalKandidat,
        totalDokumentasi,
        filteredTotal: trafficList.length,
      },
      chartData: {
        labels: Object.keys(trafficByBucket),
        data: Object.values(trafficByBucket),
      },
      topSources,
      topCities,
      logTerbaru: trafficList, // Seluruh log terfilter dikirim agar bisa dipaginasi di client dengan cepat
      currentFilter: {
        filter,
        startDate: customStart,
        endDate: customEnd,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Gagal memuat statistik dashboard.',
    };
  }
}
