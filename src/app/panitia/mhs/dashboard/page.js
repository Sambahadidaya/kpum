'use client';

import { useState, useEffect } from 'react';
import { getMhsDashboardStats, getPanitiaMhsList } from '@/api/panitia/mhs';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react';

export default function DashboardMhsPage() {
  const [stats, setStats] = useState(null);
  const [mhsList, setMhsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('belum'); // default 'belum' agar panitia bisa memantau siapa yang belum memilih
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [statRes, listRes] = await Promise.all([
      getMhsDashboardStats(),
      getPanitiaMhsList({ search, statusFilter: activeTab }),
    ]);

    if (statRes.success) {
      setStats(statRes.stats);
    }
    if (listRes.success) {
      setMhsList(listRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Dashboard Mhs (Warna Netral) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Dashboard Partisipasi Mahasiswa
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              Monitoring DPT
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau tingkat kehadiran pemilih, identifikasi mahasiswa yang belum menggunakan hak suara, dan analisis data DPT.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          title="Perbarui Data"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Perbarui Data</span>
        </button>
      </div>

      {/* 4 Stat Cards Utama (Warna Netral) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total DPT */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total DPT Terdaftar
            </span>
            <div className="w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {loading ? '...' : (stats?.totalMhs || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Mahasiswa terverifikasi
            </p>
          </div>
        </div>

        {/* Card 2: Sudah Voting */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Sudah Memilih
            </span>
            <div className="w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {loading ? '...' : (stats?.sudahVoting || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Suara sah masuk
            </p>
          </div>
        </div>

        {/* Card 3: Belum Memilih */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Belum Memilih
            </span>
            <div className="w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {loading ? '...' : (stats?.belumVoting || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Menunggu pemungutan suara
            </p>
          </div>
        </div>

        {/* Card 4: Persentase Partisipasi */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Partisipasi Pemilih
            </span>
            <div className="w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {loading ? '...' : `${stats?.persentase || 0}%`}
            </p>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats?.persentase || 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Live Feed Terbaru & Visualisasi Rasio (Netral) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rasio & Analisis Partisipasi (Grafik Batang Blue) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Rasio Partisipasi DPT</span>
          </h2>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <span>Sudah Memilih ({stats?.persentase || 0}%)</span>
                <span className="font-mono">{stats?.sudahVoting || 0} DPT</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.persentase || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span>Belum Memilih ({stats?.totalMhs ? (100 - (stats?.persentase || 0)).toFixed(1) : 0}%)</span>
                <span className="font-mono">{stats?.belumVoting || 0} DPT</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-zinc-300 dark:bg-zinc-700 h-2.5 rounded-full"
                  style={{
                    width: `${stats?.totalMhs ? (100 - (stats?.persentase || 0)).toFixed(1) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Target kuorum pemilu mahasiswa tercapai apabila jumlah suara masuk telah melebihi 50% dari total DPT terdaftar.
          </div>
        </div>

        {/* Live Feed: Mahasiswa yang Baru Saja Voting */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span>Aktivitas Pemungutan Suara Terkini</span>
          </h2>

          <div className="space-y-2.5">
            {!stats?.recentVotes || stats.recentVotes.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                Belum ada mahasiswa yang menggunakan hak suara.
              </div>
            ) : (
              stats.recentVotes.slice(0, 5).map((vote) => (
                <div
                  key={vote.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-xs border border-zinc-200 dark:border-zinc-700">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {vote.nama_mhs}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">NIM: {vote.nim}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400">
                    {new Date(vote.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabel Monitoring DPT Interaktif */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tab Filter Cepat (Netral) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('belum')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'belum'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Belum Memilih ({stats?.belumVoting || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sudah')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'sudah'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Sudah Memilih ({stats?.sudahVoting || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('semua')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'semua'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Semua DPT ({stats?.totalMhs || 0})
            </button>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIM..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            />
          </form>
        </div>

        {/* Tabel Data Mahasiswa Terfilter */}
        <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-5 font-semibold">Nama Mahasiswa</th>
                  <th className="py-3 px-4 font-semibold">NIM</th>
                  <th className="py-3 px-4 font-semibold">Kode Token</th>
                  <th className="py-3 px-4 font-semibold">Status Hak Suara</th>
                  <th className="py-3 px-5 text-right font-semibold">Waktu Memilih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {mhsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-400">
                      Tidak ada mahasiswa dalam kategori ini.
                    </td>
                  </tr>
                ) : (
                  mhsList.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-5 font-bold text-zinc-900 dark:text-zinc-100">
                        {m.nama_mhs}
                      </td>
                      <td className="py-3 px-4 font-mono">{m.nim}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                        {m.kode_voting}
                      </td>
                      <td className="py-3 px-4">
                        {m.has_voted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Sudah Voting
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold">
                            <Clock className="w-3 h-3" />
                            Belum Memilih
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right text-zinc-500 font-mono text-[11px]">
                        {m.voting_at
                          ? new Date(m.voting_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
