'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { getVotingDashboardStats } from '@/api/panitia/voting';
import {
  Vote,
  Trophy,
  Users,
  Activity,
  RefreshCw,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Calculator,
  Award,
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrasi modul Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const VOTING_CACHE_KEY = 'kpu_panitia_voting_cache';

export default function DashboardVotingPanitiaPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(VOTING_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.stats) {
            setStats(parsed.stats);
            setLastRefreshed(new Date(parsed.time || Date.now()));
            setLoading(false);
            return;
          }
        }
      } catch (e) {}
    }

    const res = await getVotingDashboardStats();
    if (res.success) {
      setStats(res.stats);
      const now = new Date();
      setLastRefreshed(now);
      try {
        localStorage.setItem(
          VOTING_CACHE_KEY,
          JSON.stringify({ stats: res.stats, time: now.toISOString() })
        );
      } catch (e) {}
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(false);

    const clearCache = () => {
      try {
        localStorage.removeItem(VOTING_CACHE_KEY);
      } catch (e) {}
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        clearCache();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', clearCache);
    window.addEventListener('beforeunload', clearCache);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', clearCache);
      window.removeEventListener('beforeunload', clearCache);
      clearCache();
    };
  }, []);

  // Urutkan peringkat paslon berdasarkan total suara masuk
  const rankedPaslon = useMemo(() => {
    if (!stats?.perolehanPaslon) return [];
    return [...stats.perolehanPaslon].sort((a, b) => b.total_suara - a.total_suara);
  }, [stats]);

  // Kalkulasi analisis mendalam
  const analisis = useMemo(() => {
    const totalDpt = stats?.totalDpt || 0;
    const totalSuara = stats?.totalSuara || 0;
    const sisaSuara = Math.max(0, totalDpt - totalSuara);
    const sisaPersen = totalDpt > 0 ? ((sisaSuara / totalDpt) * 100).toFixed(1) : 0;
    
    const leader = rankedPaslon[0] || null;
    const runnerUp = rankedPaslon[1] || null;

    const selisihSuara = leader && runnerUp ? leader.total_suara - runnerUp.total_suara : 0;
    const selisihPersen = leader && runnerUp ? (leader.persentase - runnerUp.persentase).toFixed(1) : 0;

    // Kemenangan matematis terkunci: jika selisih suara lebih besar dari seluruh sisa suara DPT yang belum voting
    const isLocked = Boolean(
      totalSuara > 0 &&
      leader &&
      sisaSuara >= 0 &&
      (rankedPaslon.length <= 1 || selisihSuara > sisaSuara)
    );

    const rataRataSuara = rankedPaslon.length > 0 ? Math.round(totalSuara / rankedPaslon.length) : 0;

    return {
      sisaSuara,
      sisaPersen,
      selisihSuara,
      selisihPersen,
      isLocked,
      rataRataSuara,
      leader,
      runnerUp,
    };
  }, [stats, rankedPaslon]);

  // Palet Warna Blue Khusus Grafik Sesuai Permintaan
  const blueChartColors = [
    'rgba(37, 99, 235, 0.9)',    // blue-600
    'rgba(59, 130, 246, 0.85)',  // blue-500
    'rgba(96, 165, 250, 0.85)',  // blue-400
    'rgba(29, 78, 216, 0.9)',    // blue-700
    'rgba(147, 197, 253, 0.85)', // blue-300
    'rgba(30, 64, 175, 0.9)',    // blue-800
  ];

  // Data Grafik Bar Suara Tiap Paslon (Warna Blue)
  const barChartData = {
    labels: (stats?.perolehanPaslon || []).map(
      (p) => `No. ${p.nomor_urut} - ${p.kandidat1?.nama_kandidat?.split(' ')[0] || ''}`
    ),
    datasets: [
      {
        label: 'Jumlah Suara Sah',
        data: (stats?.perolehanPaslon || []).map((p) => p.total_suara),
        backgroundColor: blueChartColors.slice(0, (stats?.perolehanPaslon || []).length),
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#e4e4e7',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ${context.raw} Suara Sah (${stats?.totalSuara > 0 ? ((context.raw / stats.totalSuara) * 100).toFixed(1) : 0}%)`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 10 },
          color: '#71717a',
        },
        grid: {
          color: 'rgba(113, 113, 122, 0.12)',
        },
      },
      x: {
        ticks: {
          font: { size: 10 },
          color: '#71717a',
        },
        grid: { display: false },
      },
    },
  };

  // Data Grafik Doughnut Proporsi Suara (Warna Blue)
  const doughnutChartData = {
    labels: (stats?.perolehanPaslon || []).map((p) => `Paslon No. ${p.nomor_urut}`),
    datasets: [
      {
        data: (stats?.perolehanPaslon || []).map((p) => p.total_suara),
        backgroundColor: blueChartColors.slice(0, (stats?.perolehanPaslon || []).length),
        borderWidth: 2,
        borderColor: '#18181b',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: { size: 11 },
          color: '#a1a1aa',
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#e4e4e7',
        borderColor: '#3f3f46',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} Suara`,
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Halaman (Netral) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Dashboard Rekapitulasi & Analisis E-Voting
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              KPU Live Data
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau rekapitulasi perolehan suara pasangan calon, analisis margin selisih, kuorum DPT, dan kepastian hasil pemilihan.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {lastRefreshed && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono hidden md:inline">
              Update: {lastRefreshed.toLocaleTimeString('id-ID')}
            </span>
          )}
          <button
            type="button"
            onClick={() => loadData(true)}
            title="Perbarui Hasil Suara"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Perbarui Data</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Utama (Warna Netral) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Suara Masuk */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Suara Masuk
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Vote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            {loading ? '...' : (stats?.totalSuara || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Dari total {stats?.totalDpt || 0} DPT terdaftar
          </p>
        </div>

        {/* Tingkat Partisipasi DPT */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Partisipasi Pemilih
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            {loading ? '...' : `${stats?.partisipasiPersen || 0}%`}
          </p>
          <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Number(stats?.partisipasiPersen || 0))}%` }}
            />
          </div>
        </div>

        {/* Sisa Suara Belum Memilih */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Belum Menggunakan Hak Suara
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            {loading ? '...' : analisis.sisaSuara.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            {loading ? '...' : `${analisis.sisaPersen}% DPT belum memilih`}
          </p>
        </div>

        {/* Paslon Terunggul Sementara */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Perolehan Terbanyak
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 truncate">
            {loading
              ? '...'
              : analisis.leader && (stats?.totalSuara || 0) > 0
              ? `Paslon ${analisis.leader.nomor_urut}`
              : 'Belum Ada'}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            {analisis.leader && (stats?.totalSuara || 0) > 0
              ? `${analisis.leader.total_suara} Suara (${analisis.leader.persentase}%)`
              : 'Menunggu pemungutan suara'}
          </p>
        </div>
      </div>

      {/* Panel Analisis Mendalam KPU (Fitur Baru) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Analisis Komprehensif Pemilihan
            </h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            Kalkulasi Otomatis Sistem
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Margin Selisih Pemimpin vs Runner Up */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Margin Selisih Peringkat 1 & 2
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                {analisis.selisihSuara} Suara
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                ({analisis.selisihPersen}%)
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              {analisis.leader && analisis.runnerUp && (stats?.totalSuara || 0) > 0
                ? `Paslon No. ${analisis.leader.nomor_urut} unggul ${analisis.selisihSuara} suara dari Paslon No. ${analisis.runnerUp.nomor_urut}.`
                : 'Belum cukup data suara untuk membandingkan selisih.'}
            </p>
          </div>

          {/* 2. Status Kepastian Matematis */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Status Kepastian Kemenangan
            </span>
            <div>
              {analisis.isLocked ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kemenangan Terkunci</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Kompetisi Masih Terbuka</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              {analisis.isLocked
                ? 'Secara matematis, sisa DPT yang belum memilih tidak cukup untuk membalikkan posisi peringkat pertama.'
                : `Masih ada ${analisis.sisaSuara} suara belum masuk, perolehan masih berpotensi berubah.`}
            </p>
          </div>

          {/* 3. Distribusi Rata-rata & Ambang */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Rata-rata Suara Tiap Paslon
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                {analisis.rataRataSuara} Suara
              </span>
              <span className="text-xs text-zinc-500">/ paslon</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Total {stats?.totalSuara || 0} suara terdistribusi ke {rankedPaslon.length} pasangan calon terdaftar.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Grafik: Bar Chart Suara & Doughnut Proporsi (Warna Blue) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Bar Suara per Paslon */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Grafik Perolehan Suara Sah Tiap Paslon
              </h2>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              Total {stats?.totalSuara || 0} Suara
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            {stats?.perolehanPaslon?.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
                Belum ada data paslon untuk ditampilkan.
              </div>
            )}
          </div>
        </div>

        {/* Grafik Doughnut Proporsi Suara */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Proporsi Persentase (%)
            </h2>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center pt-2">
            {(stats?.totalSuara || 0) > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-zinc-400 text-xs space-y-1">
                <p>Belum ada suara masuk.</p>
                <p className="text-[10px] opacity-75">Grafik akan aktif setelah ada pemilihan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Rekapitulasi Lengkap Terurut Peringkat */}
      <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Klasemen & Rekapitulasi Hasil Pemilihan
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {rankedPaslon.length} Pasangan Calon
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold text-center w-14">Rank</th>
                <th className="py-3 px-4 font-semibold">Nomor & Pasangan Calon</th>
                <th className="py-3 px-4 font-semibold">Calon Wakil</th>
                <th className="py-3 px-4 font-semibold text-right">Perolehan Suara</th>
                <th className="py-3 px-4 font-semibold text-right">Persentase</th>
                <th className="py-3 px-4 font-semibold">Status Posisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {rankedPaslon.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400">
                    Belum ada data paslon terdaftar.
                  </td>
                </tr>
              ) : (
                rankedPaslon.map((paslon, index) => {
                  const isLeader = index === 0 && (stats?.totalSuara || 0) > 0;
                  return (
                    <tr key={paslon.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-4 text-center font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        #{index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0">
                            {paslon.nomor_urut}
                          </span>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">
                              {paslon.kandidat1?.nama_kandidat || '-'}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              {paslon.kandidat1?.prodi_kandidat || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {paslon.kandidat2?.nama_kandidat || '-'}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {paslon.kandidat2?.prodi_kandidat || '-'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {paslon.total_suara.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {paslon.persentase}%
                      </td>
                      <td className="py-3.5 px-4">
                        {isLeader ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[10px] font-bold">
                            <Trophy className="w-3 h-3" />
                            Peringkat 1 (Memimpin)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold">
                            Tertinggal {analisis.leader ? analisis.leader.total_suara - paslon.total_suara : 0} Suara
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
