'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getSekretarisDashboardData } from '@/api/panitia/absensi';
import { formatWaktuIndo } from '@/utils/dateUtils';
import {
  ClipboardList,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Calendar,
  ArrowRight,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart2,
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const STORAGE_KEY = 'panitia_sekretaris_dashboard_data';

export default function SekretarisDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1 Query GET saat inisialisasi + simpan ke localStorage
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Ambil cache lokal dulu jika ada
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.judulList) {
              setData(parsed);
              setLoading(false);
            }
          } catch (e) {}
        }
      }

      // 1 Panggilan Server Action GET
      const res = await getSekretarisDashboardData();
      if (res.success && res.data) {
        setData(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard sekretaris:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Agregasi Statistik di Client-Side
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalJudul: 0,
        totalPanitia: 0,
        totalAbsensi: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
        tepatWaktu: 0,
        terlambat: 0,
        persentaseHadir: 0,
      };
    }

    const totalJudul = data.judulList?.length || 0;
    const totalPanitia = data.totalPanitia || 0;
    const absensiList = data.absensiList || [];
    const totalAbsensi = absensiList.length;

    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;
    let tepatWaktu = 0;
    let terlambat = 0;

    absensiList.forEach((a) => {
      if (a.jenis_absensi === 'hadir') hadir++;
      else if (a.jenis_absensi === 'izin') izin++;
      else if (a.jenis_absensi === 'sakit') sakit++;
      else if (a.jenis_absensi === 'alpha') alpha++;

      if (a.keterlambatan === 'tepat_waktu') tepatWaktu++;
      else if (a.keterlambatan === 'terlambat') terlambat++;
    });

    const persentaseHadir = totalAbsensi > 0 ? Math.round((hadir / totalAbsensi) * 100) : 0;

    return {
      totalJudul,
      totalPanitia,
      totalAbsensi,
      hadir,
      izin,
      sakit,
      alpha,
      tepatWaktu,
      terlambat,
      persentaseHadir,
    };
  }, [data]);

  // Data Bar Chart: Rekap 5 Agenda Terakhir (Aksen Blue 5-10%, Netral)
  const barChartData = useMemo(() => {
    if (!data || !data.judulList || data.judulList.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Ambil maksimal 5 agenda terbaru
    const recentJudul = [...data.judulList].slice(0, 5).reverse();
    const labels = recentJudul.map((j) => {
      const title = j.judul_absensi_panitia || 'Agenda';
      return title.length > 18 ? title.slice(0, 18) + '...' : title;
    });

    const hadirCounts = [];
    const lainnyaCounts = [];

    recentJudul.forEach((j) => {
      const items = (data.absensiList || []).filter((a) => a.judul_absensi_panitia_id === j.id);
      const hadir = items.filter((a) => a.jenis_absensi === 'hadir').length;
      const lainnya = items.filter((a) => a.jenis_absensi !== 'hadir').length;
      hadirCounts.push(hadir);
      lainnyaCounts.push(lainnya);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Hadir',
          data: hadirCounts,
          backgroundColor: '#2563eb', // Blue-600
          borderRadius: 6,
        },
        {
          label: 'Izin / Sakit / Alpha',
          data: lainnyaCounts,
          backgroundColor: '#71717a', // Zinc-500
          borderRadius: 6,
        },
      ],
    };
  }, [data]);

  // Data Doughnut Chart: Komposisi Jenis Kehadiran
  const doughnutChartData = useMemo(() => {
    return {
      labels: ['Hadir', 'Izin', 'Sakit', 'Alpha'],
      datasets: [
        {
          data: [stats.hadir, stats.izin, stats.sakit, stats.alpha],
          backgroundColor: [
            '#2563eb', // Hadir (Blue-600)
            '#a1a1aa', // Izin (Zinc-400)
            '#71717a', // Sakit (Zinc-500)
            '#3f3f46', // Alpha (Zinc-700)
          ],
          borderColor: '#18181b',
          borderWidth: 1,
        },
      ],
    };
  }, [stats]);

  // Absensi Terbaru (5 item)
  const recentAbsensi = useMemo(() => {
    if (!data || !data.absensiList) return [];
    return data.absensiList.slice(0, 5);
  }, [data]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Dashboard Sekretaris
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              Presensi & Notulensi
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Ringkasan data kehadiran panitia, rekapitulasi agenda rapat, dan evaluasi kedisiplinan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/panitia/sekretaris/absensi"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95"
          >
            <UserCheck className="w-4 h-4 text-blue-400 dark:text-blue-600" />
            <span>Kelola Absensi</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Utama (Warna Netral Zinc + Aksen Blue 5-10%) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Agenda Absensi */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Total Agenda
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {loading && !data ? '...' : stats.totalJudul}
            </span>
            <span className="text-xs text-zinc-400 ml-1.5 font-medium">Sesi Kegiatan</span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Daftar agenda aktif</span>
            <Link
              href="/panitia/sekretaris/judul-absensi"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              Lihat <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Total Absensi Tercatat */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Total Presensi
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {loading && !data ? '...' : stats.totalAbsensi}
            </span>
            <span className="text-xs text-zinc-400 ml-1.5 font-medium">Data Kehadiran</span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Dari seluruh agenda</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {stats.totalPanitia} Panitia Terdata
            </span>
          </div>
        </div>

        {/* Card 3: Rata-Rata Kehadiran */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Tingkat Kehadiran
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {loading && !data ? '...' : `${stats.persentaseHadir}%`}
            </span>
            <span className="text-xs text-zinc-400 ml-1.5 font-medium">Hadir Tepat & Izin</span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Status Hadir</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {stats.hadir} / {stats.totalAbsensi}
            </span>
          </div>
        </div>

        {/* Card 4: Kedisiplinan Waktu */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Ketepatan Waktu
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {loading && !data ? '...' : stats.tepatWaktu}
            </span>
            <span className="text-xs text-zinc-400 ml-1.5 font-medium">Tepat Waktu</span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Terlambat</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              {stats.terlambat} Panitia
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart & Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1 & 2: Bar Chart Perbandingan per Agenda */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Partisipasi 5 Agenda Terakhir
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400">Hadir vs Tidak Hadir</span>
          </div>

          {stats.totalJudul === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-zinc-400 text-xs space-y-2">
              <ClipboardList className="w-8 h-8" />
              <p>Belum ada data agenda yang dibuat.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 12,
                        font: { size: 11 },
                        color: '#a1a1aa',
                      },
                    },
                    tooltip: {
                      backgroundColor: '#18181b',
                      titleColor: '#ffffff',
                      bodyColor: '#e4e4e7',
                      borderColor: '#27272a',
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 10 }, color: '#a1a1aa' },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, font: { size: 10 }, color: '#a1a1aa' },
                      grid: { color: 'rgba(161, 161, 170, 0.1)' },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Kolom 3: Doughnut Chart Status Kehadiran */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Proporsi Kehadiran
              </h2>
            </div>
          </div>

          {stats.totalAbsensi === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-zinc-400 text-xs space-y-2">
              <UserCheck className="w-8 h-8" />
              <p>Belum ada rekaman kehadiran.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 w-full relative">
                <Doughnut
                  data={doughnutChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#18181b',
                        titleColor: '#ffffff',
                        bodyColor: '#e4e4e7',
                      },
                    },
                    cutout: '70%',
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                    {stats.totalAbsensi}
                  </span>
                  <span className="text-[10px] text-zinc-400">Total Absen</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-zinc-400">Hadir</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{stats.hadir}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-zinc-400">Izin</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{stats.izin}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-zinc-400">Sakit</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{stats.sakit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-zinc-400">Alpha</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{stats.alpha}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabel 5 Rekaman Absensi Terakhir */}
      <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Aktivitas Absensi Terbaru
            </h2>
          </div>
          <Link
            href="/panitia/sekretaris/absensi"
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            Buka Halaman Absensi <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAbsensi.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs">
            Belum ada rekaman kehadiran terbaru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-5 font-semibold">Agenda Kegiatan</th>
                  <th className="py-3 px-4 font-semibold">Nama Panitia</th>
                  <th className="py-3 px-4 font-semibold">Status Kehadiran</th>
                  <th className="py-3 px-4 font-semibold">Ketepatan</th>
                  <th className="py-3 px-4 font-semibold">Waktu Tercatat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {recentAbsensi.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-5 font-bold text-zinc-900 dark:text-zinc-100">
                      {item.judul_absensi_panitia?.judul_absensi_panitia || 'Agenda Rapat'}
                    </td>
                    <td className="py-3 px-4">
                      {item.panitia?.nama_panitia || 'Panitia'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.jenis_absensi === 'hadir'
                            ? 'bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-zinc-200 dark:border-zinc-800'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {item.jenis_absensi}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {item.keterlambatan === 'tepat_waktu'
                        ? 'Tepat Waktu'
                        : item.keterlambatan === 'terlambat'
                        ? 'Terlambat'
                        : 'Tidak Hadir'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                      {item.created_at ? formatWaktuIndo(item.created_at) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
