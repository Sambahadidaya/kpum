'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getPanitiaTrafikSosmedData,
  hapusSemuaTrafikSosmed,
  hapusTrafikSosmedPerTanggal,
  hapusTrafikSosmedLebihLamaDari,
} from '@/api/panitia/panitia';
import { formatWaktuIndo } from '@/utils/dateUtils';
import {
  Activity,
  Trash2,
  Calendar,
  RefreshCw,
  Search,
  UserCheck,
  TrendingUp,
  Share2,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BarChart2,
  Filter,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Registrasi modul Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CACHE_KEY = 'kpu_panitia_trafik_sosmed_data';

export default function TrafikSosmedPanitiaPage() {
  const [rawPanitiaList, setRawPanitiaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter State Dropdown seperti /panitia/dashboard
  const [filterType, setFilterType] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Search & Pagination State
  const [searchPanitiaQuery, setSearchPanitiaQuery] = useState('');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const logItemsPerPage = 15;

  // Cleanup interval
  const [manualInterval, setManualInterval] = useState(7);
  const [filterDateForDelete, setFilterDateForDelete] = useState('');

  // 1. Logika LocalStorage / SessionStorage: Ambil data dari cache jika ada, jika tidak fetch database
  const loadDataFromSource = async (forceRefresh = false) => {
    setLoading(true);

    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRawPanitiaList(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Gagal membaca cache lokal:', err);
      }
    }

    // 1 Query Pemanggilan Database Tunggal jika belum ada di cache atau di-refresh
    const res = await getPanitiaTrafikSosmedData();
    if (res.success && res.rawPanitiaList) {
      setRawPanitiaList(res.rawPanitiaList);
      if (typeof window !== 'undefined') {
        try {
          const dataStr = JSON.stringify(res.rawPanitiaList);
          sessionStorage.setItem(CACHE_KEY, dataStr);
          localStorage.setItem(CACHE_KEY, dataStr);
        } catch (err) {
          console.warn('Gagal menyimpan cache lokal:', err);
        }
      }
    }
    setLoading(false);
  };

  // Bersihkan cache saat keluar website (tab/browser ditutup)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    loadDataFromSource(false);
  }, []);

  // 2. Pengolahan Data Client-Side Berdasarkan Filter Waktu Aktif (Tanpa Query Database Ulang)
  const processedData = useMemo(() => {
    const now = new Date();
    let startTime = null;
    let endTime = null;

    if (filterType === 'today') {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      startTime = todayStart.getTime();
    } else if (filterType === '7days') {
      startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (filterType === '30days') {
      startTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    } else if (filterType === 'custom' && startDate) {
      const s = new Date(`${startDate}T00:00:00.000Z`);
      startTime = s.getTime();
      if (endDate) {
        const e = new Date(`${endDate}T23:59:59.999Z`);
        endTime = e.getTime();
      }
    }

    const allLogs = [];
    const dailyMap = {};
    let totalClicks = 0;
    let totalWA = 0;
    let totalIG = 0;
    let totalTikTok = 0;
    let totalThreads = 0;

    const panitiaStats = (rawPanitiaList || []).map((p) => {
      const sosmedItem = Array.isArray(p.sosmed_panitia) && p.sosmed_panitia.length > 0
        ? p.sosmed_panitia[0]
        : (p.sosmed_panitia || {});

      const rawClicks = Array.isArray(sosmedItem?.trafik_sosmed) ? sosmedItem.trafik_sosmed : [];

      // Saring log klik yang masuk dalam rentang waktu filter
      const filteredClicks = rawClicks.filter((c) => {
        if (!c.created_at) return false;
        const time = new Date(c.created_at).getTime();
        if (startTime && time < startTime) return false;
        if (endTime && time > endTime) return false;
        return true;
      });

      const clicksCount = filteredClicks.length;
      totalClicks += clicksCount;

      const perPlatform = {
        whatsapp: 0,
        instagram: 0,
        tiktok: 0,
        threads: 0,
      };

      let lastClicked = null;
      filteredClicks.forEach((c) => {
        if (!lastClicked || new Date(c.created_at) > new Date(lastClicked)) {
          lastClicked = c.created_at;
        }

        const plat = (c.platform || '').toLowerCase().trim();
        if (plat === 'whatsapp' || plat === 'wa') {
          perPlatform.whatsapp += 1;
          totalWA += 1;
        } else if (plat === 'instagram' || plat === 'ig') {
          perPlatform.instagram += 1;
          totalIG += 1;
        } else if (plat === 'tiktok') {
          perPlatform.tiktok += 1;
          totalTikTok += 1;
        } else if (plat === 'threads') {
          perPlatform.threads += 1;
          totalThreads += 1;
        } else {
          // Jika tanpa tag (misal sebelum kolom platform), hitung ke sosmed yang tersedia
          if (sosmedItem.instagram && !sosmedItem.whatsapp) {
            perPlatform.instagram += 1;
            totalIG += 1;
          } else if (sosmedItem.whatsapp && !sosmedItem.instagram) {
            perPlatform.whatsapp += 1;
            totalWA += 1;
          } else {
            // Jika ada beberapa, beri prioritas ke Instagram atau proporsional
            perPlatform.instagram += 1;
            totalIG += 1;
          }
        }

        allLogs.push({
          id: c.id,
          platform: c.platform || null,
          created_at: c.created_at,
          panitia: {
            id: p.id,
            nama_panitia: p.nama_panitia,
            prodi_panitia: p.prodi_panitia,
            jabatan_panitia: p.jabatan_panitia,
            sub_jabatan_panitia: p.sub_jabatan_panitia,
            foto_panitia: p.foto_panitia,
          },
          sosmed: {
            whatsapp: sosmedItem?.whatsapp || null,
            instagram: sosmedItem?.instagram || null,
            threads: sosmedItem?.threads || null,
            tiktok: sosmedItem?.tiktok || null,
          },
        });

        // Hitung data tren harian
        const dateKey = new Date(c.created_at).toISOString().split('T')[0];
        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1;
      });

      return {
        id: p.id,
        nama: p.nama_panitia,
        prodi: p.prodi_panitia,
        jabatan: p.jabatan_panitia,
        subJabatan: p.sub_jabatan_panitia,
        foto: p.foto_panitia,
        sosmed: {
          whatsapp: sosmedItem?.whatsapp || null,
          instagram: sosmedItem?.instagram || null,
          threads: sosmedItem?.threads || null,
          tiktok: sosmedItem?.tiktok || null,
        },
        hasSosmed: Boolean(
          sosmedItem?.whatsapp ||
          sosmedItem?.instagram ||
          sosmedItem?.threads ||
          sosmedItem?.tiktok
        ),
        totalClicks: clicksCount,
        perPlatform,
        lastClicked,
      };
    });

    // Urutkan analisis panitia berdasarkan total klik (Ranking)
    panitiaStats.sort((a, b) => b.totalClicks - a.totalClicks);

    const rataRata = panitiaStats.length > 0 ? totalClicks / panitiaStats.length : 0;
    panitiaStats.forEach((item, index) => {
      item.ranking = index + 1;
      item.persentase = totalClicks > 0 ? ((item.totalClicks / totalClicks) * 100).toFixed(1) : 0;
      if (item.totalClicks === 0) {
        item.status = 'Belum Ada Klik';
      } else if (item.totalClicks >= rataRata) {
        item.status = 'Tinggi';
      } else {
        item.status = 'Aktif';
      }
    });

    // Urutkan log dari yang terbaru
    allLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Siapkan label & dataset untuk grafik garis (Line Chart Blue)
    const daysCount = filterType === 'today' ? 1 : filterType === '30days' ? 30 : 7;
    const chartLabels = [];
    const chartValues = [];

    if (filterType === 'today') {
      const todayKey = now.toISOString().split('T')[0];
      chartLabels.push('Hari Ini');
      chartValues.push(dailyMap[todayKey] || 0);
    } else {
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        chartLabels.push(label);
        chartValues.push(dailyMap[key] || 0);
      }
    }

    // Top 5 Panitia untuk Bar Chart Blue
    const topPanitia = panitiaStats.slice(0, 5);
    const rankingLabels = topPanitia.map((p) => p.nama);
    const rankingValues = topPanitia.map((p) => p.totalClicks);

    return {
      analisisPanitia: panitiaStats,
      allLogs,
      summary: {
        totalClicks,
        totalWA,
        totalIG,
        totalTikTok,
        totalThreads,
        totalPanitia: panitiaStats.length,
        panitiaPernahDiklik: panitiaStats.filter((p) => p.totalClicks > 0).length,
        panitiaBelumDiklik: panitiaStats.filter((p) => p.totalClicks === 0).length,
        rataRataKlik: rataRata.toFixed(1),
        topPanitiaUtama: panitiaStats[0] || null,
        chartLabels,
        chartValues,
        rankingLabels,
        rankingValues,
      },
    };
  }, [rawPanitiaList, filterType, startDate, endDate]);

  const { analisisPanitia, allLogs, summary } = processedData;

  // Handler pergantian filter (Instan berubah via storage)
  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterType(val);
    if (val === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
    }
  };

  const getFilterLabel = () => {
    if (filterType === 'today') return 'Hari Ini';
    if (filterType === '30days') return '30 Hari Terakhir';
    if (filterType === 'all') return 'Semua Waktu';
    if (filterType === 'custom') {
      return startDate ? `${startDate} s/d ${endDate || 'Sekarang'}` : 'Rentang Kustom';
    }
    return '7 Hari Terakhir';
  };

  // Filtered Analisis Panitia berdasarkan search
  const filteredAnalisisPanitia = useMemo(() => {
    if (!searchPanitiaQuery.trim()) return analisisPanitia;
    const q = searchPanitiaQuery.toLowerCase();
    return analisisPanitia.filter((item) => {
      const nama = item.nama?.toLowerCase() || '';
      const jabatan = item.jabatan?.toLowerCase() || '';
      const prodi = item.prodi?.toLowerCase() || '';
      return nama.includes(q) || jabatan.includes(q) || prodi.includes(q);
    });
  }, [analisisPanitia, searchPanitiaQuery]);

  // Filtered logs berdasarkan search
  const filteredLogs = useMemo(() => {
    if (!searchLogQuery.trim()) return allLogs;
    const q = searchLogQuery.toLowerCase();
    return allLogs.filter((item) => {
      const p = item.panitia;
      const nama = p?.nama_panitia?.toLowerCase() || '';
      const jabatan = p?.jabatan_panitia?.toLowerCase() || '';
      return nama.includes(q) || jabatan.includes(q);
    });
  }, [allLogs, searchLogQuery]);

  const totalLogPages = Math.ceil(filteredLogs.length / logItemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (logCurrentPage - 1) * logItemsPerPage;
    return filteredLogs.slice(start, start + logItemsPerPage);
  }, [filteredLogs, logCurrentPage]);

  // Aksi Pembersihan Riwayat
  const handleHapusSemua = async () => {
    if (
      confirm(
        'PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SELURUH riwayat trafik klik sosial media panitia? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      setActionLoading(true);
      const res = await hapusSemuaTrafikSosmed();
      if (res.success) {
        alert(res.message);
        loadDataFromSource(true);
      } else {
        alert(res.error || 'Gagal menghapus data.');
      }
      setActionLoading(false);
    }
  };

  const handleHapusPerTanggal = async () => {
    if (!filterDateForDelete) {
      alert('Silakan tentukan tanggal pembersihan terlebih dahulu.');
      return;
    }
    if (confirm(`Hapus seluruh riwayat trafik sosmed pada tanggal ${filterDateForDelete}?`)) {
      setActionLoading(true);
      const res = await hapusTrafikSosmedPerTanggal(filterDateForDelete);
      if (res.success) {
        alert(res.message);
        loadDataFromSource(true);
      } else {
        alert(res.error || 'Gagal menghapus data per tanggal.');
      }
      setActionLoading(false);
    }
  };

  const handleManualCleanInterval = async () => {
    if (
      confirm(
        `Bersihkan seluruh data log trafik sosmed yang lebih lama dari ${manualInterval} hari yang lalu?`
      )
    ) {
      setActionLoading(true);
      const res = await hapusTrafikSosmedLebihLamaDari(manualInterval);
      if (res.success) {
        alert(res.message);
        loadDataFromSource(true);
      } else {
        alert(res.error || 'Gagal membersihkan data.');
      }
      setActionLoading(false);
    }
  };

  // Konfigurasi Chart Tren Kunjungan Harian (Warna Blue)
  const lineChartData = {
    labels: summary?.chartLabels || [],
    datasets: [
      {
        label: 'Jumlah Interaksi/Klik',
        data: summary?.chartValues || [],
        borderColor: '#2563eb', // Blue-600
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#e4e4e7',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#71717a', font: { size: 11 } },
        grid: { color: 'rgba(113, 113, 122, 0.15)' },
      },
    },
  };

  // Konfigurasi Bar Chart Ranking Panitia (Warna Blue)
  const barChartData = {
    labels: (summary?.rankingLabels || []).length > 0 ? summary.rankingLabels : ['Belum ada data'],
    datasets: [
      {
        label: 'Total Klik',
        data: (summary?.rankingValues || []).length > 0 ? summary.rankingValues : [0],
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#1d4ed8',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#e4e4e7',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#71717a', font: { size: 11 } },
        grid: { color: 'rgba(113, 113, 122, 0.15)' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { size: 11 } },
      },
    },
  };

  const topPanitiaUtama = summary?.topPanitiaUtama;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link
              href="/panitia/panitia"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1 font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Struktur Panitia</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-300 font-medium">Trafik Sosmed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Analisis Trafik Media Sosial Panitia
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Data analitik terpadu (1 query pemanggilan database & instan diolah via local storage cache).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/panitia/panitia"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition active:scale-95 shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Kelola Struktur Panitia</span>
          </Link>
          <button
            onClick={() => loadDataFromSource(true)}
            disabled={loading || actionLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-2xs disabled:opacity-50"
            title="Ambil data paling segar dari database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Rincian Klik Tiap Platform Sosial Media (4 Netral Cards Detail) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Instagram */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Instagram</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
              <i className="fa-brands fa-instagram text-xs sm:text-sm" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {summary?.totalIG || 0}
            </span>
            <span className="text-xs text-zinc-500">klik</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500">Tautan profil Instagram</p>
        </div>

        {/* Total WhatsApp */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">WhatsApp</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
              <i className="fa-brands fa-whatsapp text-xs sm:text-sm" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {summary?.totalWA || 0}
            </span>
            <span className="text-xs text-zinc-500">klik</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500">Pesan kontak WhatsApp</p>
        </div>

        {/* Total TikTok */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">TikTok</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
              <i className="fa-brands fa-tiktok text-xs sm:text-sm" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {summary?.totalTikTok || 0}
            </span>
            <span className="text-xs text-zinc-500">klik</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500">Tautan akun TikTok</p>
        </div>

        {/* Total Threads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Threads</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
              <i className="fa-brands fa-threads text-xs sm:text-sm" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {summary?.totalThreads || 0}
            </span>
            <span className="text-xs text-zinc-500">klik</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500">Tautan akun Threads</p>
        </div>
      </div>

      {/* Bagian Visualisasi Grafik dengan Dropdown Filter Rentang Waktu (Seperti /panitia/dashboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik 1: Tren Kunjungan Garis (Dengan Filter Dropdown Seperti /panitia/dashboard) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Tren Kunjungan ({getFilterLabel()})
                </h3>
              </div>
              <p className="text-xs text-zinc-500">
                Aktivitas klik sosial media panitia terfilter instan dari cache lokal
              </p>
            </div>

            {/* Dropdown Filter Rentang Waktu Seperti /panitia/dashboard */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={filterType}
                  onChange={handleFilterChange}
                  className="appearance-none pl-8 pr-8 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition shadow-2xs"
                >
                  <option value="7days">7 Hari Terakhir</option>
                  <option value="today">Hari Ini</option>
                  <option value="30days">30 Hari Terakhir</option>
                  <option value="all">Semua Waktu</option>
                  <option value="custom">Pilih Rentang Kustom...</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Form Rentang Kustom jika memilih custom */}
          {showCustomDate && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Dari:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Sampai:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs"
                />
              </div>
            </div>
          )}

          <div className="h-64 w-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Grafik 2: Ranking Panitia Paling Banyak Diklik (Bar Chart Blue) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Top Panitia ({getFilterLabel()})
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              Peringkat akumulasi seluruh klik sosmed panitia
            </p>
          </div>

          <div className="h-64 w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* TABEL UTAMA: ANALISIS LENGKAP DETAIL TIAP SOSMED PANITIA */}
      {/* ============================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Analisis Rinci Tiap Sosial Media Panitia
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Rincian jumlah klik untuk tiap akun Instagram, WhatsApp, TikTok, dan Threads masing-masing panitia ({getFilterLabel()})
            </p>
          </div>

          {/* Search Panitia */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchPanitiaQuery}
              onChange={(e) => setSearchPanitiaQuery(e.target.value)}
              placeholder="Cari nama, jabatan, prodi..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Tabel Analisis Lengkap per Panitia */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">Rank</th>
                <th className="py-3 px-3.5">Panitia</th>
                <th className="py-3 px-3.5">Jabatan & Prodi</th>
                <th className="py-3 px-3.5">Rincian Tiap Sosmed (Klik)</th>
                <th className="py-3 px-3.5 text-center">Total Klik</th>
                <th className="py-3 px-3.5 text-center">Persentase</th>
                <th className="py-3 px-3.5">Terakhir Diklik</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
                      <span>Mengolah data analisis sosmed...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAnalisisPanitia.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">
                        Tidak Ada Data Panitia Ditemukan
                      </p>
                      <p className="text-[11px] text-zinc-500 max-w-xs">
                        Pastikan data panitia telah ditambahkan di menu Struktur Panitia.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAnalisisPanitia.map((item) => {
                  const isTopOne = item.ranking === 1 && item.totalClicks > 0;
                  const pSosmed = item.perPlatform;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                        isTopOne ? 'bg-zinc-50/70 dark:bg-zinc-900/30' : ''
                      }`}
                    >
                      {/* Ranking */}
                      <td className="py-3.5 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                            item.ranking === 1 && item.totalClicks > 0
                              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-black'
                              : item.ranking <= 3 && item.totalClicks > 0
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                              : 'text-zinc-400 font-normal'
                          }`}
                        >
                          {item.ranking}
                        </span>
                      </td>

                      {/* Panitia */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {item.foto ? (
                              <Image
                                src={item.foto}
                                alt={item.nama}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-[11px]">
                                {item.nama?.[0] || 'P'}
                              </div>
                            )}
                          </div>
                          <div className="truncate max-w-[150px] sm:max-w-[200px]">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                              {item.nama}
                            </span>
                            <span className="text-[10px] text-zinc-500 truncate block">
                              {item.subJabatan || item.prodi}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Jabatan & Prodi */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 block w-fit">
                          {item.jabatan}
                        </span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">
                          {item.prodi}
                        </span>
                      </td>

                      {/* RINCIAN TIAP SOSMED: Instagram, WA, TikTok, Threads */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Instagram */}
                          {item.sosmed.instagram ? (
                            <span
                              title={`Instagram: ${pSosmed.instagram} klik`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200"
                            >
                              <i className="fa-brands fa-instagram text-xs text-zinc-500" />
                              <span className="font-bold">{pSosmed.instagram}</span>
                            </span>
                          ) : null}

                          {/* WhatsApp */}
                          {item.sosmed.whatsapp ? (
                            <span
                              title={`WhatsApp: ${pSosmed.whatsapp} klik`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200"
                            >
                              <i className="fa-brands fa-whatsapp text-xs text-zinc-500" />
                              <span className="font-bold">{pSosmed.whatsapp}</span>
                            </span>
                          ) : null}

                          {/* TikTok */}
                          {item.sosmed.tiktok ? (
                            <span
                              title={`TikTok: ${pSosmed.tiktok} klik`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200"
                            >
                              <i className="fa-brands fa-tiktok text-xs text-zinc-500" />
                              <span className="font-bold">{pSosmed.tiktok}</span>
                            </span>
                          ) : null}

                          {/* Threads */}
                          {item.sosmed.threads ? (
                            <span
                              title={`Threads: ${pSosmed.threads} klik`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200"
                            >
                              <i className="fa-brands fa-threads text-xs text-zinc-500" />
                              <span className="font-bold">{pSosmed.threads}</span>
                            </span>
                          ) : null}

                          {!item.hasSosmed && (
                            <span className="text-[10px] text-zinc-400 italic">
                              Tidak ada akun sosmed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Klik Panitia Ini */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-black inline-block ${
                            item.totalClicks > 0
                              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xs'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {item.totalClicks} klik
                        </span>
                      </td>

                      {/* Persentase */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full"
                              style={{ width: `${Math.min(100, item.persentase)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 font-semibold w-10 text-right">
                            {item.persentase}%
                          </span>
                        </div>
                      </td>

                      {/* Terakhir Diklik */}
                      <td className="py-3.5 px-3.5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                        {item.lastClicked ? formatWaktuIndo(item.lastClicked) : '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            item.status === 'Tinggi'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 font-bold'
                              : item.status === 'Aktif'
                              ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                              : 'text-zinc-400 border-transparent italic'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Konfigurasi & Panel Pembersihan Riwayat + Log Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Aksi Pembersihan Manual (Mirip dengan Manajemen Trafik) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Pembersihan Riwayat Trafik
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Kelola dan bersihkan data log interaksi sosmed lama
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Opsi 1: Hapus per Tanggal Tertentu */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Hapus Berdasarkan Tanggal
                </span>
                <input
                  type="date"
                  value={filterDateForDelete}
                  onChange={(e) => setFilterDateForDelete(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs"
                />
                <button
                  type="button"
                  onClick={handleHapusPerTanggal}
                  disabled={actionLoading || !filterDateForDelete}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Hapus Data Tanggal Ini
                </button>
              </div>

              {/* Opsi 2: Pembersihan Berdasarkan Interval Hari */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Pangkas Data Lama
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={manualInterval}
                    onChange={(e) => setManualInterval(parseInt(e.target.value, 10))}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    <option value={3}>Lebih dari 3 hari</option>
                    <option value={7}>Lebih dari 7 hari</option>
                    <option value={14}>Lebih dari 14 hari</option>
                    <option value={30}>Lebih dari 30 hari</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleManualCleanInterval}
                    disabled={actionLoading}
                    className="py-1.5 px-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Pangkas
                  </button>
                </div>
              </div>

              {/* Opsi 3: Reset Seluruh Data */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <ShieldAlert className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold">Reset Total Riwayat</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Menghapus semua riwayat klik sosial media panitia dari database secara permanen.
                </p>
                <button
                  type="button"
                  onClick={handleHapusSemua}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  Hapus Seluruh Data Trafik Sosmed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Log Riwayat Aktivitas Interaksi */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Catatan Riwayat Log Aktivitas ({getFilterLabel()})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Urutan kronologis setiap kali kontak sosial media panitia ditekan pengunjung
                </p>
              </div>

              {/* Pencarian di dalam log */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchLogQuery}
                  onChange={(e) => setSearchLogQuery(e.target.value)}
                  placeholder="Cari panitia pada log..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>
            </div>

            {/* List Tabel Log */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5">Waktu Kunjungan</th>
                    <th className="py-3 px-3.5">Panitia</th>
                    <th className="py-3 px-3.5">Platform Diklik</th>
                    <th className="py-3 px-3.5 text-center">Akun Terpasang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
                          <span>Memuat log aktivitas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Activity className="w-5 h-5 text-zinc-400" />
                          <p className="font-semibold text-xs">Belum ada riwayat aktivitas pada periode ini</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => {
                      const p = log.panitia;
                      const sosmed = log.sosmed;
                      const plat = (log.platform || '').toLowerCase();

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <td className="py-3 px-3.5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                            {formatWaktuIndo(log.created_at)}
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate max-w-[150px]">
                              {p?.nama_panitia || '-'}
                            </span>
                            <span className="text-[10px] text-zinc-500 block truncate max-w-[150px]">
                              {p?.jabatan_panitia || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                              {plat === 'whatsapp' ? (
                                <i className="fa-brands fa-whatsapp text-emerald-600" />
                              ) : plat === 'instagram' ? (
                                <i className="fa-brands fa-instagram text-pink-600" />
                              ) : plat === 'tiktok' ? (
                                <i className="fa-brands fa-tiktok text-zinc-900 dark:text-zinc-100" />
                              ) : plat === 'threads' ? (
                                <i className="fa-brands fa-threads text-zinc-900 dark:text-zinc-100" />
                              ) : (
                                <Share2 className="w-3 h-3 text-zinc-500" />
                              )}
                              <span>{plat || 'Sosial Media'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                              {sosmed?.whatsapp && (
                                <span title="WhatsApp" className="text-zinc-600 dark:text-zinc-400">
                                  <i className="fa-brands fa-whatsapp text-xs" />
                                </span>
                              )}
                              {sosmed?.instagram && (
                                <span title="Instagram" className="text-zinc-600 dark:text-zinc-400">
                                  <i className="fa-brands fa-instagram text-xs" />
                                </span>
                              )}
                              {sosmed?.tiktok && (
                                <span title="TikTok" className="text-zinc-600 dark:text-zinc-400">
                                  <i className="fa-brands fa-tiktok text-xs" />
                                </span>
                              )}
                              {sosmed?.threads && (
                                <span title="Threads" className="text-zinc-600 dark:text-zinc-400">
                                  <i className="fa-brands fa-threads text-xs" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Log */}
            {totalLogPages > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
                <span>
                  Halaman {logCurrentPage} dari {totalLogPages} ({filteredLogs.length} data)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLogCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={logCurrentPage === 1}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLogCurrentPage((p) => Math.min(totalLogPages, p + 1))}
                    disabled={logCurrentPage === totalLogPages}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
