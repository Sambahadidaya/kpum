'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getAiStats, getAiLogs } from '@/api/panitia/ai';
import { formatWaktuIndo } from '@/utils/dateUtils';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PanitiaAiDashboardPage() {
  const [daysFilter, setDaysFilter] = useState('7');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // State Table Logs
  const [logs, setLogs] = useState([]);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [logsLoading, setLogsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modal Detail Log
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await getAiStats(daysFilter);
    if (res.success) {
      setStats(res.data);
    }
    setStatsLoading(false);
  }, [daysFilter]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    const res = await getAiLogs({
      limit: pageSize,
      page: currentPage,
      status: statusFilter,
      search: searchQuery,
    });
    if (res.success) {
      setLogs(res.data || []);
      setTotalLogsCount(res.count || 0);
    }
    setLogsLoading(false);
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(totalLogsCount / pageSize) || 1;

  // Chart 1: Tren Harian Pertanyaan
  const trendsData = stats?.dailyTrends || [];
  const lineChartData = {
    labels: trendsData.map((d) => d.date.slice(5)), // MM-DD
    datasets: [
      {
        label: 'Total Pertanyaan',
        data: trendsData.map((d) => d.total),
        borderColor: '#2563eb', // blue-600
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Berhasil',
        data: trendsData.map((d) => d.success),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'transparent',
        tension: 0.35,
        borderDash: [4, 4],
        pointRadius: 2,
      },
      {
        label: 'Ditolak / Non-Pemilu',
        data: trendsData.map((d) => d.rejected),
        borderColor: '#f59e0b', // amber-500
        backgroundColor: 'transparent',
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };

  // Chart 2: Token Usage Harian
  const tokenBarData = {
    labels: trendsData.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: 'Token Input',
        data: trendsData.map((d) => d.tokensInput),
        backgroundColor: '#6366f1',
        borderRadius: 4,
      },
      {
        label: 'Token Output',
        data: trendsData.map((d) => d.tokensOutput),
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
      },
    ],
  };

  // Chart 3: Doughnut Status
  const statusDoughnutData = {
    labels: ['Sukses', 'Ditolak (Out of Scope)', 'Error'],
    datasets: [
      {
        data: [
          stats?.successCount || 0,
          stats?.rejectedCount || 0,
          stats?.errorCount || 0,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  // Chart 4: Processing Time vs Latency
  const performanceLineData = {
    labels: trendsData.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: 'Rata-rata Processing (ms)',
        data: trendsData.map((d) => d.avgProcessingMs),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Dashboard AI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Dashboard Analitik Sams Asisten
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                AI Panitia
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Pemantauan performa kecerdasan buatan, token usage, akurasi FAQ, dan interaksi pengguna.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Filter Periode */}
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
          >
            <option value="7">7 Hari Terakhir</option>
            <option value="14">14 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>

          <button
            onClick={() => {
              fetchStats();
              fetchLogs();
            }}
            disabled={statsLoading || logsLoading}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer active:scale-95"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading || logsLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/panitia/ai/setting"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Setting AI & FAQ</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid (Desktop: 4 Kolom) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Total Pertanyaan */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Total Pertanyaan</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {statsLoading ? '...' : (stats?.totalQueries || 0).toLocaleString()}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Tercatat di sistem
            </p>
          </div>
        </div>

        {/* Card 2: Tingkat Keberhasilan */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Tingkat Sukses</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {statsLoading ? '...' : `${stats?.successRate || 0}%`}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {stats?.successCount || 0} berhasil dijawab
            </p>
          </div>
        </div>

        {/* Card 3: FAQ Match Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Akurasi FAQ</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {statsLoading ? '...' : `${stats?.faqMatchRate || 0}%`}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {stats?.matchedFaqCount || 0} pertanyaan sesuai basis FAQ
            </p>
          </div>
        </div>

        {/* Card 4: Total Token Usage */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Total Token</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {statsLoading ? '...' : (stats?.totalTokens || 0).toLocaleString()}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {stats?.totalInputTokens?.toLocaleString() || 0} in / {stats?.totalOutputTokens?.toLocaleString() || 0} out
            </p>
          </div>
        </div>

        {/* Card 5: Processing Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Rata-rata Waktu Server</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {statsLoading ? '...' : `${stats?.avgProcessingMs || 0} ms`}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Respons OpenAI engine
            </p>
          </div>
        </div>

        {/* Card 6: Latency Client */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Rata-rata Total Latensi</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {statsLoading ? '...' : `${stats?.avgLatencyMs || 0} ms`}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Waktu total di sisi client
            </p>
          </div>
        </div>

        {/* Card 7: Pertanyaan Ditolak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Pertanyaan Ditolak</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {statsLoading ? '...' : (stats?.rejectedCount || 0).toLocaleString()}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Di luar konteks pemilu / spam
            </p>
          </div>
        </div>

        {/* Card 8: Error / Gagal */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Gangguan / Error</span>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-red-600 dark:text-red-400">
              {statsLoading ? '...' : (stats?.errorCount || 0).toLocaleString()}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Koneksi atau kuota terputus
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid (Desktop: 2 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Tren Harian */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Tren Volume Pertanyaan Harian
              </h2>
              <p className="text-[11px] text-zinc-500">Aktivitas mahasiswa bertanya ke Sams Asisten</p>
            </div>
          </div>
          <div className="h-64">
            {trendsData.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                Belum ada data percakapan pada rentang waktu ini.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Token Usage Harian */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Konsumsi Token Harian
              </h2>
              <p className="text-[11px] text-zinc-500">Perbandingan prompt token (in) vs completion (out)</p>
            </div>
          </div>
          <div className="h-64">
            {trendsData.length > 0 ? (
              <Bar data={tokenBarData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                Belum ada data token pada rentang waktu ini.
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Distribusi Status */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Distribusi Status Respon
              </h2>
              <p className="text-[11px] text-zinc-500">Rasio respon berhasil, ditolak, dan error</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            {stats?.totalQueries > 0 ? (
              <Doughnut
                data={statusDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                  },
                }}
              />
            ) : (
              <div className="text-xs text-zinc-400">Belum ada data interaksi.</div>
            )}
          </div>
        </div>

        {/* Chart 4: Response Time Performance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Performa Waktu Pemrosesan (ms)
              </h2>
              <p className="text-[11px] text-zinc-500">Kecepatan OpenAI menghasilkan jawaban per hari</p>
            </div>
          </div>
          <div className="h-64">
            {trendsData.length > 0 ? (
              <Line data={performanceLineData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                Belum ada data latensi pada rentang waktu ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Table Log Percakapan */}
      <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* Filter bar tabel */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Log Interaksi Sams Asisten
            </h3>
            <p className="text-xs text-zinc-500">
              Total {totalLogsCount.toLocaleString()} riwayat percakapan tercatat
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari pertanyaan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-hidden w-44 sm:w-56"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 pr-2 py-0.5 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="s">Sukses ('s')</option>
                <option value="r">Ditolak ('r')</option>
                <option value="e">Error ('e')</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Waktu</th>
                <th className="py-3 px-4 font-semibold">Pertanyaan</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">FAQ Match</th>
                <th className="py-3 px-4 font-semibold">Token</th>
                <th className="py-3 px-4 font-semibold">Durasi</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {logsLoading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-400">
                    Memuat data riwayat percakapan...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-400">
                    Tidak ditemukan data log yang sesuai.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                        {formatWaktuIndo(log.created_at)}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-medium text-zinc-900 dark:text-zinc-100">
                        {log.pertanyaan || <span className="text-zinc-400 italic">Tanpa pertanyaan</span>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.status === 's' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Sukses
                          </span>
                        )}
                        {log.status === 'r' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Ditolak
                          </span>
                        )}
                        {log.status === 'e' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                            Error
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.matched_faq ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cocok
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">Umum</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {log.total_tokens || 0}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {log.processing_ms ? `${log.processing_ms} ms` : '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition cursor-pointer"
                          title="Lihat Detail Pesan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi Table */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || logsLoading}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-950 dark:hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || logsLoading}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-950 dark:hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Log */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4.5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Detail Interaksi AI
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Info Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Waktu</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatWaktuIndo(selectedLog.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Status</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Total Token</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedLog.total_tokens} ({selectedLog.tokens_input} in / {selectedLog.tokens_output} out)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Durasi</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedLog.processing_ms} ms
                  </span>
                </div>
              </div>

              {/* Pertanyaan */}
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-1.5">
                  Pertanyaan Pengguna
                </label>
                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
                  {selectedLog.pertanyaan || '-'}
                </div>
              </div>

              {/* Jawaban */}
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-1.5">
                  Jawaban AI
                </label>
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedLog.jawaban || <span className="text-zinc-400 italic">Tidak ada balasan</span>}
                </div>
              </div>

              {/* Error Message jika ada */}
              {selectedLog.error_msg && (
                <div>
                  <label className="text-[11px] font-bold text-red-500 uppercase block mb-1.5">
                    Pesan Kesalahan
                  </label>
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
                    {selectedLog.error_msg}
                  </div>
                </div>
              )}

              {/* Metadata Tambahan */}
              <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span>Session ID: {selectedLog.session_id || '-'}</span>
                <span>IP: {selectedLog.ip_address || '-'}</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
