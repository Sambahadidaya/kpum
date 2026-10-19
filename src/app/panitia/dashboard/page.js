'use client';

import { useState, useEffect, useMemo } from 'react';
import { getDashboardStats } from '@/api/panitia/dashboard';
import { formatWaktuIndo } from '@/utils/dateUtils';
import {
  TrendingUp,
  Users,
  FolderKanban,
  Mail,
  Activity,
  MapPin,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart2,
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

// Register Chart.js elements
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

export default function PanitiaDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Filter Waktu Global
  const [filterType, setFilterType] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  // State Pagination untuk Aktivitas Kunjungan Terkini
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchStats = async (overrideFilter) => {
    setLoading(true);
    const activeFilter = overrideFilter || filterType;
    const res = await getDashboardStats({
      filter: activeFilter,
      startDate: activeFilter === 'custom' ? startDate : null,
      endDate: activeFilter === 'custom' ? endDate : null,
    });

    if (res.success) {
      setData(res);
      setCurrentPage(1); // Reset page ke 1 saat filter baru
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterType(val);
    if (val === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      fetchStats(val);
    }
  };

  const applyCustomFilter = (e) => {
    e.preventDefault();
    if (startDate) {
      fetchStats('custom');
    }
  };

  const stats = data?.stats || {
    totalTrafik: 0,
    totalKontak: 0,
    pesanBelumDibaca: 0,
    totalKandidat: 0,
    totalDokumentasi: 0,
    filteredTotal: 0,
  };

  const chartLabels = data?.chartData?.labels || [];
  const chartValues = data?.chartData?.data || [];

  // Konfigurasi Line Chart (Grafik Garis & Titik-titik Kunjungan)
  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Jumlah Kunjungan',
        data: chartValues,
        fill: true,
        borderColor: '#2563eb', // Blue-600
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4.5,
        pointHoverRadius: 7,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#09090b',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { size: 10, weight: '500' } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(113, 113, 122, 0.12)' },
        ticks: { precision: 0, color: '#71717a', font: { size: 10 } },
      },
    },
  };

  // Konfigurasi Bar Chart untuk Sebaran Kota Pemilih
  const topCities = data?.topCities || [];
  const cityLabels = topCities.map((c) => c.name);
  const cityValues = topCities.map((c) => c.count);

  const barChartData = {
    labels: cityLabels,
    datasets: [
      {
        label: 'Kunjungan',
        data: cityValues,
        backgroundColor: [
          '#1d4ed8',
          '#2563eb',
          '#3b82f6',
          '#60a5fa',
          '#93c5fd',
          '#cbd5e1',
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    indexAxis: 'y', // Bar horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#09090b',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(113, 113, 122, 0.12)' },
        ticks: { precision: 0, color: '#71717a', font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { size: 11, weight: '600' } },
      },
    },
  };

  // Data Paginasi untuk Aktivitas Kunjungan Terkini
  const allLogs = data?.logTerbaru || [];
  const totalPages = Math.max(1, Math.ceil(allLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allLogs.slice(start, start + pageSize);
  }, [allLogs, currentPage, pageSize]);

  // Label filter deskriptif
  const getFilterLabel = () => {
    if (filterType === 'today') return 'Hari Ini';
    if (filterType === '30days') return '30 Hari Terakhir';
    if (filterType === 'all') return 'Semua Waktu';
    if (filterType === 'custom') {
      return startDate ? `${startDate} s/d ${endDate || 'Sekarang'}` : 'Rentang Kustom';
    }
    return '7 Hari Terakhir';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Dashboard & Tombol Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Dashboard Pemantauan Pemilu
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ringkasan statistik lalu lintas pemilih, pesan masuk, dan aktivitas portal KPU.
          </p>
        </div>

        <button
          onClick={() => fetchStats()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 4 Kartu Ringkasan (Stats Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trafik */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Kunjungan</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {stats.totalTrafik.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>Pengunjung terlacak otomatis</span>
            </p>
          </div>
        </div>

        {/* Pesan Kontak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Pesan Pengaduan</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {stats.totalKontak}
            </div>
            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 mt-1 font-medium">
              {stats.pesanBelumDibaca} pesan baru belum dibaca
            </p>
          </div>
        </div>

        {/* Total Kandidat */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Kandidat Mahasiswa</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {stats.totalKandidat}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Calon terverifikasi di portal
            </p>
          </div>
        </div>

        {/* Total Dokumentasi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Arsip Dokumentasi</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
              <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {stats.totalDokumentasi}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Kegiatan terhubung Google Drive
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Grafik Garis Kunjungan dengan Dropdown Filter Global & Saluran Sumber Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Div Grafik Kunjungan (Line Chart dengan Filter Dropdown Kustom) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Statistik Kunjungan ({getFilterLabel()})
                </h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tren grafik garis lalu lintas mahasiswa membuka website KPU
              </p>
            </div>

            {/* Dropdown Filter Rentang Waktu */}
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

          {/* Form Input Rentang Kustom (Jika memilih custom) */}
          {showCustomDate && (
            <form
              onSubmit={applyCustomFilter}
              className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 font-medium">Dari:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 font-medium">Sampai:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-xs focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition active:scale-95 cursor-pointer shadow-xs"
              >
                Terapkan Filter
              </button>
            </form>
          )}

          {/* Line Chart Container (Grafik Garis & Titik-titik) */}
          <div className="h-64 sm:h-72 w-full pt-2">
            {chartLabels.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                Belum ada data kunjungan pada rentang waktu ini.
              </div>
            ) : (
              <Line data={lineChartData} options={lineChartOptions} />
            )}
          </div>
        </div>

        {/* Top Sumber Trafik (Mengikuti filter yang aktif) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Saluran Sumber Traffic
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Rujukan mahasiswa membuka portal ({getFilterLabel()})
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {(data?.topSources || []).length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                Belum ada data rujukan pada rentang waktu ini.
              </p>
            ) : (
              (data?.topSources || []).map((src, i) => {
                const total = (data?.topSources || []).reduce((acc, curr) => acc + curr.count, 0) || 1;
                const percent = Math.round((src.count / total) * 100);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{src.name}</span>
                      <span className="font-mono text-zinc-500 dark:text-zinc-400 font-bold">
                        {src.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(percent, 100)}%` }}
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Aktivitas Kunjungan Terkini (Next-Back Pagination) & Sebaran Kota Pemilih (Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Aktivitas Kunjungan Terkini dengan Tombol Next-Back Pagination */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Aktivitas Kunjungan Terkini
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Total {allLogs.length} kunjungan terdata ({getFilterLabel()})
              </p>
            </div>

            {/* Tombol Next - Back Pagination */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] text-zinc-500 font-mono">
                Hal {currentPage} dari {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="pb-3 font-semibold">Kota / Wilayah</th>
                  <th className="pb-3 font-semibold">ISP / Jaringan</th>
                  <th className="pb-3 font-semibold">Sumber</th>
                  <th className="pb-3 font-semibold">Halaman</th>
                  <th className="pb-3 font-semibold">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      Belum ada catatan aktivitas kunjungan pada rentang ini.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, i) => (
                    <tr key={log.id || i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition">
                      <td className="py-2.5 font-medium flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{log.kota || 'Indonesia'}</span>
                      </td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] truncate max-w-[140px]">
                        {log.isp || 'Lokal'}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          {log.sumber || 'Direct'}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                        {log.path || '/'}
                      </td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                        {formatWaktuIndo(log.visited_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sebaran Kota Pemilih (Grafik Bar Horizontal) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Sebaran Kota Pemilih
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Grafik bar wilayah ({getFilterLabel()})
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {cityLabels.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                Belum ada data wilayah pada rentang waktu ini.
              </div>
            ) : (
              <Bar data={barChartData} options={barChartOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
