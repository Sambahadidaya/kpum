'use client';

import { useState, useEffect, useMemo } from 'react';
import { getMhsDashboardStats, getPanitiaMhsList } from '@/api/panitia/mhs';
import { VALID_KELAS } from '@/lib/mhsConstants';
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
  BarChart3,
  Filter,
  ChevronDown,
  Layers,
  BookOpen,
  Calendar,
} from 'lucide-react';

const DASH_MHS_CACHE_KEY = 'kpu_panitia_mhs_dash_cache';

export default function DashboardMhsPage() {
  const [stats, setStats] = useState(null);
  const [mhsList, setMhsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filter States
  const [activeTab, setActiveTab] = useState('belum'); // 'semua' | 'belum' | 'sudah'
  const [kelasFilter, setKelasFilter] = useState('semua');
  const [angkatanFilter, setAngkatanFilter] = useState('semua');
  const [prodiFilter, setProdiFilter] = useState('semua');

  // State untuk Dropdown Filter UL/LI
  const [openDropdown, setOpenDropdown] = useState(null); // 'status' | 'kelas' | 'angkatan' | 'prodi'

  const loadData = async (forceRefresh = false) => {
    setLoading(true);

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(DASH_MHS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.stats && Array.isArray(parsed?.list)) {
            setStats(parsed.stats);
            setMhsList(parsed.list);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}
    }

    const [statRes, listRes] = await Promise.all([
      getMhsDashboardStats(),
      getPanitiaMhsList({ search: '', statusFilter: 'semua' }),
    ]);

    let newStats = null;
    let newList = [];

    if (statRes.success) {
      newStats = statRes.stats;
      setStats(newStats);
    }
    if (listRes.success) {
      newList = listRes.data || [];
      setMhsList(newList);
    }

    try {
      if (newStats && newList) {
        localStorage.setItem(
          DASH_MHS_CACHE_KEY,
          JSON.stringify({ stats: newStats, list: newList })
        );
      }
    } catch (e) {}

    setLoading(false);
  };

  // Setup Lifecycle Caching & Reset saat Pindah Tab (Pola AdminPresenceTracker)
  useEffect(() => {
    loadData(false);

    const clearCache = () => {
      try {
        localStorage.removeItem(DASH_MHS_CACHE_KEY);
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

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-filter-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Opsi Angkatan dan Prodi Unik
  const angkatanOptions = useMemo(() => {
    const set = new Set();
    mhsList.forEach((m) => {
      if (m.angkatan && m.angkatan !== '-') set.add(m.angkatan);
    });
    return Array.from(set).sort();
  }, [mhsList]);

  const prodiOptions = useMemo(() => {
    const set = new Set();
    mhsList.forEach((m) => {
      if (m.prodi && m.prodi !== '-') set.add(m.prodi);
    });
    return Array.from(set).sort();
  }, [mhsList]);

  // Data Terfilter Dinamis di Sisi Klien
  const filteredMhsList = useMemo(() => {
    return mhsList.filter((m) => {
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchName = m.nama_mhs?.toLowerCase().includes(term);
        const matchNim = m.nim?.toLowerCase().includes(term);
        const matchKode = m.kode_voting?.toLowerCase().includes(term);
        if (!matchName && !matchNim && !matchKode) return false;
      }

      if (activeTab === 'sudah' && !m.has_voted) return false;
      if (activeTab === 'belum' && m.has_voted) return false;

      if (kelasFilter !== 'semua' && m.kelas !== kelasFilter) return false;
      if (angkatanFilter !== 'semua' && m.angkatan !== angkatanFilter) return false;
      if (prodiFilter !== 'semua' && m.prodi !== prodiFilter) return false;

      return true;
    });
  }, [mhsList, search, activeTab, kelasFilter, angkatanFilter, prodiFilter]);

  // Kalkulasi Analisis Dinamis Berdasarkan Data Keseluruhan atau Filter Aktif
  const dynamicAnalysis = useMemo(() => {
    const list = mhsList;
    const total = list.length;
    const sudah = list.filter((m) => m.has_voted).length;
    const belum = total - sudah;
    const persen = total > 0 ? ((sudah / total) * 100).toFixed(1) : 0;

    // Per Kelas
    const perKelas = {};
    VALID_KELAS.forEach((k) => {
      perKelas[k] = { total: 0, sudah: 0, belum: 0, persen: 0 };
    });
    list.forEach((m) => {
      const k = VALID_KELAS.includes(m.kelas) ? m.kelas : 'Reg';
      perKelas[k].total += 1;
      if (m.has_voted) perKelas[k].sudah += 1;
      else perKelas[k].belum += 1;
    });
    Object.keys(perKelas).forEach((k) => {
      const t = perKelas[k].total;
      perKelas[k].persen = t > 0 ? ((perKelas[k].sudah / t) * 100).toFixed(1) : 0;
    });

    // Per Angkatan (Top 6)
    const perAngkatan = {};
    list.forEach((m) => {
      const ang = m.angkatan || '-';
      if (!perAngkatan[ang]) perAngkatan[ang] = { total: 0, sudah: 0, belum: 0, persen: 0 };
      perAngkatan[ang].total += 1;
      if (m.has_voted) perAngkatan[ang].sudah += 1;
      else perAngkatan[ang].belum += 1;
    });
    Object.keys(perAngkatan).forEach((a) => {
      const t = perAngkatan[a].total;
      perAngkatan[a].persen = t > 0 ? ((perAngkatan[a].sudah / t) * 100).toFixed(1) : 0;
    });

    // Per Prodi
    const perProdi = {};
    list.forEach((m) => {
      const p = m.prodi || '-';
      if (!perProdi[p]) perProdi[p] = { total: 0, sudah: 0, belum: 0, persen: 0 };
      perProdi[p].total += 1;
      if (m.has_voted) perProdi[p].sudah += 1;
      else perProdi[p].belum += 1;
    });
    Object.keys(perProdi).forEach((p) => {
      const t = perProdi[p].total;
      perProdi[p].persen = t > 0 ? ((perProdi[p].sudah / t) * 100).toFixed(1) : 0;
    });

    return {
      total,
      sudah,
      belum,
      persen,
      perKelas,
      perAngkatan,
      perProdi,
    };
  }, [mhsList]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Dashboard Mhs (Warna Netral) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Dashboard & Analisis DPT Mahasiswa
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              Monitoring DPT
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau tingkat kehadiran pemilih, analisis segmen kelas, angkatan, program studi, dan filter interaktif mahasiswa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData(true)}
          title="Perbarui Data & Cache"
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
              {loading ? '...' : dynamicAnalysis.total.toLocaleString('id-ID')}
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
              {loading ? '...' : dynamicAnalysis.sudah.toLocaleString('id-ID')}
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
              {loading ? '...' : dynamicAnalysis.belum.toLocaleString('id-ID')}
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
              {loading ? '...' : `${dynamicAnalysis.persen}%`}
            </p>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(dynamicAnalysis.persen))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PANEL ANALISIS MENDALAM DARI KOLOM BARU (KELAS, ANGKATAN, PRODI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Analisis Berdasarkan Kelas */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Partisipasi per Kelas
              </h2>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">DPT LP3I</span>
          </div>

          <div className="space-y-3">
            {Object.entries(dynamicAnalysis.perKelas).map(([k, item]) => (
              <div key={k} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{k}</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{item.persen}% ({item.sudah}/{item.total})</span>
                </div>
                <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Number(item.persen))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Sudah: {item.sudah}</span>
                  <span>Belum: {item.belum}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Analisis Berdasarkan Angkatan */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Partisipasi per Angkatan
              </h2>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Parsing NIM</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {Object.keys(dynamicAnalysis.perAngkatan).length === 0 ? (
              <p className="text-center text-xs text-zinc-400 py-6">Belum ada data angkatan</p>
            ) : (
              Object.entries(dynamicAnalysis.perAngkatan).map(([ang, item]) => (
                <div key={ang} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Angkatan {ang}</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{item.persen}% ({item.sudah}/{item.total})</span>
                  </div>
                  <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Number(item.persen))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Sudah: {item.sudah}</span>
                    <span>Belum: {item.belum}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Analisis Berdasarkan Program Studi */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Partisipasi per Prodi
              </h2>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Kode Prodi</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {Object.keys(dynamicAnalysis.perProdi).length === 0 ? (
              <p className="text-center text-xs text-zinc-400 py-6">Belum ada data prodi</p>
            ) : (
              Object.entries(dynamicAnalysis.perProdi).map(([prd, item]) => (
                <div key={prd} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">{prd}</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{item.persen}% ({item.sudah}/{item.total})</span>
                  </div>
                  <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Number(item.persen))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Sudah: {item.sudah}</span>
                    <span>Belum: {item.belum}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FILTER & TABEL MONITORING MAHASISWA DENGAN FILTER UL/LI */}
      <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Audit Data Pemilih (DPT)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tinjau daftar spesifik mahasiswa yang belum atau sudah memilih dengan filter fleksibel.
            </p>
          </div>

          {/* Tab Cepat Status */}
          <div className="inline-flex p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('belum')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'belum'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Belum Memilih ({dynamicAnalysis.belum})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sudah')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'sudah'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Sudah Memilih ({dynamicAnalysis.sudah})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('semua')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'semua'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Semua ({dynamicAnalysis.total})
            </button>
          </div>
        </div>

        {/* Filter Dropdown UL/LI dan Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIM, atau kode voting..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter Kelas UL/LI */}
            <div className="relative dropdown-filter-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'kelas' ? null : 'kelas')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
              >
                <span className="text-zinc-400">Kelas:</span>
                <span className="font-bold">{kelasFilter === 'semua' ? 'Semua' : kelasFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>

              {openDropdown === 'kelas' && (
                <ul className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 text-xs space-y-0.5 animate-in fade-in">
                  <li key="semua">
                    <button
                      type="button"
                      onClick={() => {
                        setKelasFilter('semua');
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center justify-between ${
                        kelasFilter === 'semua' ? 'font-bold text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900/60' : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span>Semua Kelas</span>
                      {kelasFilter === 'semua' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                  {VALID_KELAS.map((k) => (
                    <li key={k}>
                      <button
                        type="button"
                        onClick={() => {
                          setKelasFilter(k);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center justify-between ${
                          kelasFilter === k ? 'font-bold text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900/60' : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span>{k}</span>
                        {kelasFilter === k && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Filter Angkatan UL/LI */}
            <div className="relative dropdown-filter-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'angkatan' ? null : 'angkatan')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
              >
                <span className="text-zinc-400">Angkatan:</span>
                <span className="font-bold">{angkatanFilter === 'semua' ? 'Semua' : angkatanFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>

              {openDropdown === 'angkatan' && (
                <ul className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 text-xs space-y-0.5 max-h-56 overflow-y-auto animate-in fade-in">
                  <li key="semua">
                    <button
                      type="button"
                      onClick={() => {
                        setAngkatanFilter('semua');
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center justify-between ${
                        angkatanFilter === 'semua' ? 'font-bold text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900/60' : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span>Semua Angkatan</span>
                      {angkatanFilter === 'semua' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                  {angkatanOptions.map((ang) => (
                    <li key={ang}>
                      <button
                        type="button"
                        onClick={() => {
                          setAngkatanFilter(ang);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center justify-between ${
                          angkatanFilter === ang ? 'font-bold text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900/60' : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span>{ang}</span>
                        {angkatanFilter === ang && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Filter Prodi UL/LI */}
            <div className="relative dropdown-filter-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'prodi' ? null : 'prodi')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
              >
                <span className="text-zinc-400">Prodi:</span>
                <span className="font-bold truncate max-w-[110px]">{prodiFilter === 'semua' ? 'Semua' : prodiFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>

              {openDropdown === 'prodi' && (
                <ul className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 text-xs space-y-0.5 max-h-56 overflow-y-auto animate-in fade-in">
                  <li key="semua">
                    <button
                      type="button"
                      onClick={() => {
                        setProdiFilter('semua');
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center justify-between ${
                        prodiFilter === 'semua' ? 'font-bold text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900/60' : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span>Semua Program Studi</span>
                      {prodiFilter === 'semua' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                  {prodiOptions.map((prd) => (
                    <li key={prd}>
                      <button
                        type="button"
                        onClick={() => {
                          setProdiFilter(prd);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center justify-between ${
                          prodiFilter === prd ? 'font-bold text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900/60' : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className="truncate pr-2">{prd}</span>
                        {prodiFilter === prd && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Tabel Data Mahasiswa */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Mahasiswa</th>
                <th className="py-3 px-3 font-semibold">NIM</th>
                <th className="py-3 px-3 font-semibold">Kelas</th>
                <th className="py-3 px-3 font-semibold">Angkatan</th>
                <th className="py-3 px-3 font-semibold">Program Studi</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Waktu Memilih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
              {filteredMhsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    Tidak ada data mahasiswa yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredMhsList.slice(0, 100).map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {m.nama_mhs}
                    </td>
                    <td className="py-3 px-3 font-mono">{m.nim}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-[10px]">
                        {m.kelas || 'Reg'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">
                      {m.angkatan || '-'}
                    </td>
                    <td className="py-3 px-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {m.prodi || '-'}
                    </td>
                    <td className="py-3 px-3">
                      {m.has_voted ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Sudah Voting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold">
                          Belum Memilih
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 font-mono text-[11px]">
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
          {filteredMhsList.length > 100 && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
              Menampilkan 100 data pertama dari total {filteredMhsList.length} mahasiswa tersaring.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
