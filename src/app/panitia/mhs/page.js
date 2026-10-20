'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  getPanitiaMhsList,
  tambahMhsManual,
  tambahMhsBulk,
  updateMhs,
  hapusMhs,
} from '@/api/panitia/mhs';
import { VALID_KELAS, PRODI_MAP } from '@/lib/mhsConstants';
import {
  GraduationCap,
  UserPlus,
  FileSpreadsheet,
  Trash2,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  FileCheck,
  ChevronDown,
} from 'lucide-react';

const MHS_CACHE_KEY = 'kpu_panitia_mhs_cache';

export default function PanitiaMhsPage() {
  const [mhsList, setMhsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filter States
  const [statusFilter, setStatusFilter] = useState('semua'); // 'semua' | 'belum' | 'sudah'
  const [kelasFilter, setKelasFilter] = useState('semua');
  const [angkatanFilter, setAngkatanFilter] = useState('semua');
  const [prodiFilter, setProdiFilter] = useState('semua');

  // State untuk Dropdown Filter UL/LI
  const [openDropdown, setOpenDropdown] = useState(null); // 'status' | 'kelas' | 'angkatan' | 'prodi'

  // Modal Tambah/Edit Manual
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nama_mhs: '',
    nim: '',
    kode_voting: '',
    kelas: 'Reg',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Modal Upload Excel
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelRows, setExcelRows] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [excelImporting, setExcelImporting] = useState(false);
  const [excelResultMsg, setExcelResultMsg] = useState(null);
  const fileInputRef = useRef(null);

  // Load Data dengan Dukungan LocalStorage Cache
  const loadData = async (forceRefresh = false) => {
    setLoading(true);

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(MHS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMhsList(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Abaikan jika gagal membaca cache
      }
    }

    const res = await getPanitiaMhsList({ search: '', statusFilter: 'semua' });
    if (res.success) {
      setMhsList(res.data || []);
      try {
        localStorage.setItem(MHS_CACHE_KEY, JSON.stringify(res.data || []));
      } catch (e) {}
    }
    setLoading(false);
  };

  // Setup Lifecycle & Pembersihan Cache saat Pindah Tab / Tutup Window (Pola AdminPresenceTracker)
  useEffect(() => {
    loadData(false);

    const clearCache = () => {
      try {
        localStorage.removeItem(MHS_CACHE_KEY);
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

  // Generate kode acak 6 karakter unik
  const generateRandomKode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, kode_voting: result }));
  };

  const handleOpenManual = (mhs = null) => {
    setErrorText('');
    if (mhs) {
      setEditId(mhs.id);
      setFormData({
        nama_mhs: mhs.nama_mhs,
        nim: mhs.nim,
        kode_voting: mhs.kode_voting,
        kelas: mhs.kelas || 'Reg',
      });
    } else {
      setEditId(null);
      setFormData({
        nama_mhs: '',
        nim: '',
        kode_voting: Math.random().toString(36).substring(2, 8).toUpperCase(),
        kelas: 'Reg',
      });
    }
    setManualModalOpen(true);
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');

    let res;
    if (editId) {
      res = await updateMhs(editId, formData);
    } else {
      res = await tambahMhsManual(formData);
    }

    if (res.success) {
      setManualModalOpen(false);
      loadData(true);
    } else {
      setErrorText(res.error || 'Gagal menyimpan data mahasiswa.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, nama) => {
    if (confirm(`Hapus data mahasiswa ${nama}? Jika sudah melakukan voting, data suara terkait juga akan terhapus.`)) {
      const res = await hapusMhs(id);
      if (res.success) {
        loadData(true);
      } else {
        alert(res.error || 'Gagal menghapus data mahasiswa.');
      }
    }
  };

  // Handle pembacaan file Excel (.xlsx, .xls, .csv) dengan kolom kelas
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setExcelResultMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const formatted = jsonData
          .map((row) => {
            const rawKelas = (row.kelas || row.Kelas || row.KELAS || 'Reg').toString().trim();
            const cleanKelas = VALID_KELAS.includes(rawKelas) ? rawKelas : 'Reg';

            return {
              nama_mhs: row.nama_mhs || row.nama || row.Nama || row['Nama Lengkap'] || '',
              nim: String(row.nim || row.NIM || row.Nim || '').trim(),
              kode_voting: String(row.kode_voting || row.kode || row.Kode || row.token || '').trim(),
              kelas: cleanKelas,
            };
          })
          .filter((item) => item.nama_mhs && item.nim);

        setExcelRows(formatted);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan file tidak rusak.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportExcel = async () => {
    if (excelRows.length === 0) return;
    setExcelImporting(true);
    setExcelResultMsg(null);

    const res = await tambahMhsBulk(excelRows);
    if (res.success) {
      setExcelResultMsg({
        type: 'success',
        text: `Berhasil mengimpor ${res.insertedCount} data mahasiswa baru. (${res.skippedCount} dilewati karena NIM sudah ada).`,
      });
      setExcelRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadData(true);
    } else {
      setExcelResultMsg({
        type: 'error',
        text: res.error || 'Gagal mengimpor file Excel.',
      });
    }
    setExcelImporting(false);
  };

  // Ambil opsi filter unik untuk Angkatan dan Prodi dari data mhs
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

  // Filter Data di Sisi Klien untuk Kecepatan Instan
  const filteredMhsList = useMemo(() => {
    return mhsList.filter((m) => {
      // 1. Search
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchName = m.nama_mhs?.toLowerCase().includes(term);
        const matchNim = m.nim?.toLowerCase().includes(term);
        const matchKode = m.kode_voting?.toLowerCase().includes(term);
        if (!matchName && !matchNim && !matchKode) return false;
      }

      // 2. Status
      if (statusFilter === 'sudah' && !m.has_voted) return false;
      if (statusFilter === 'belum' && m.has_voted) return false;

      // 3. Kelas
      if (kelasFilter !== 'semua' && m.kelas !== kelasFilter) return false;

      // 4. Angkatan
      if (angkatanFilter !== 'semua' && m.angkatan !== angkatanFilter) return false;

      // 5. Prodi
      if (prodiFilter !== 'semua' && m.prodi !== prodiFilter) return false;

      return true;
    });
  }, [mhsList, search, statusFilter, kelasFilter, angkatanFilter, prodiFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Halaman (Netral) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Manajemen Data Mahasiswa (DPT)
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              Hak Suara
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola data pemilih tetap, pengelompokan kelas, parsing angkatan & prodi otomatis dari NIM, dan generate kode voting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setExcelResultMsg(null);
              setExcelRows([]);
              setExcelModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenManual(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Filter & Bar Pencarian */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, NIM, atau token kode voting..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
          />
        </div>

        {/* Dropdown Filters (UL / LI) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter 1: Status Voting Dropdown UL/LI */}
            <div className="relative dropdown-filter-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
              >
                <span className="text-zinc-400">Status:</span>
                <span className="font-bold capitalize">{statusFilter === 'semua' ? 'Semua' : statusFilter === 'sudah' ? 'Sudah Voting' : 'Belum Memilih'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>

              {openDropdown === 'status' && (
                <ul className="absolute left-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 text-xs space-y-0.5 animate-in fade-in">
                  {[
                    { id: 'semua', label: 'Semua Status' },
                    { id: 'belum', label: 'Belum Memilih' },
                    { id: 'sudah', label: 'Sudah Voting' },
                  ].map((opt) => (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center justify-between ${
                          statusFilter === opt.id ? 'font-bold text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900/60' : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {statusFilter === opt.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Filter 2: Kelas Dropdown UL/LI */}
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
                <ul className="absolute left-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 text-xs space-y-0.5 animate-in fade-in">
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

            {/* Filter 3: Angkatan Dropdown UL/LI */}
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
                <ul className="absolute left-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 text-xs space-y-0.5 max-h-56 overflow-y-auto animate-in fade-in">
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

            {/* Filter 4: Prodi Dropdown UL/LI */}
            <div className="relative dropdown-filter-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'prodi' ? null : 'prodi')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
              >
                <span className="text-zinc-400">Prodi:</span>
                <span className="font-bold truncate max-w-[120px]">{prodiFilter === 'semua' ? 'Semua' : prodiFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>

              {openDropdown === 'prodi' && (
                <ul className="absolute left-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 text-xs space-y-0.5 max-h-56 overflow-y-auto animate-in fade-in">
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

            {/* Reset Filter Button jika ada filter aktif */}
            {(statusFilter !== 'semua' || kelasFilter !== 'semua' || angkatanFilter !== 'semua' || prodiFilter !== 'semua' || search) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('semua');
                  setKelasFilter('semua');
                  setAngkatanFilter('semua');
                  setProdiFilter('semua');
                  setSearch('');
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline cursor-pointer pl-1"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Tombol Perbarui Data (Refresh & Update LocalStorage Cache) */}
          <button
            type="button"
            onClick={() => loadData(true)}
            title="Perbarui Data & Cache"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer ml-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Perbarui Data</span>
          </button>
        </div>
      </div>

      {/* Tabel Data Mahasiswa dengan Kolom Baru: Kelas, Angkatan, Prodi */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-lg transition-all">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Menampilkan <strong>{filteredMhsList.length}</strong> dari <strong>{mhsList.length}</strong> mahasiswa DPT</span>
            <span className="font-mono text-[11px]">Query Cached (LocalStorage Aktif)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Nama Mahasiswa</th>
                  <th className="py-3.5 px-3 font-semibold">NIM</th>
                  <th className="py-3.5 px-3 font-semibold">Kelas</th>
                  <th className="py-3.5 px-3 font-semibold">Angkatan</th>
                  <th className="py-3.5 px-3 font-semibold">Program Studi</th>
                  <th className="py-3.5 px-3 font-semibold">Kode Voting</th>
                  <th className="py-3.5 px-3 font-semibold">Status Voting</th>
                  <th className="py-3.5 px-3 font-semibold">Waktu Memilih</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {filteredMhsList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      Tidak ada data mahasiswa yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredMhsList.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {m.nama_mhs}
                      </td>
                      <td className="py-3.5 px-3 font-mono">{m.nim}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-[10px]">
                          {m.kelas || 'Reg'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium">
                        {m.angkatan || '-'}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-zinc-800 dark:text-zinc-200">
                        {m.prodi || '-'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono font-bold text-zinc-800 dark:text-zinc-200 text-[11px]">
                          {m.kode_voting}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {m.has_voted ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-900 dark:border-zinc-100 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Sudah Voting
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold">
                            Belum Memilih
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-zinc-500 font-mono text-[11px]">
                        {m.voting_at
                          ? new Date(m.voting_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenManual(m)}
                          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title="Edit Mahasiswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id, m.nama_mhs)}
                          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Hapus Mahasiswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Manual dengan Input Kelas */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {editId ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Manual'}
              </h3>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorText && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleSaveManual} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Lengkap Mahasiswa
                </label>
                <input
                  type="text"
                  value={formData.nama_mhs}
                  onChange={(e) => setFormData({ ...formData, nama_mhs: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nomor Induk Mahasiswa (NIM)
                </label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="Contoh: 21010045"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                />
                <p className="text-[10px] text-zinc-400">
                  Angkatan (4 digit awal) dan Prodi (2 digit berikutnya) dihitung otomatis untuk kelas Reg & NonReg.
                </p>
              </div>

              {/* Input Kelas Baru */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Golongan / Kelas
                </label>
                <select
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 cursor-pointer"
                >
                  <option value="Reg">Reguler (Reg)</option>
                  <option value="NonReg">Non Reguler (NonReg)</option>
                  <option value="Manaj">Manajemen (Manaj)</option>
                  <option value="Dosen">Dosen</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kode Token Voting
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomKode}
                    className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold hover:underline cursor-pointer"
                  >
                    Acak Kode Baru
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.kode_voting}
                    onChange={(e) => setFormData({ ...formData, kode_voting: e.target.value.toUpperCase() })}
                    placeholder="Contoh: A7X9Q2"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload Excel dengan Dukungan Kolom Kelas */}
      {excelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Impor Berkas Excel Data Mahasiswa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExcelModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {excelResultMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 shrink-0 ${
                  excelResultMsg.type === 'success'
                    ? 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                    : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                }`}
              >
                {excelResultMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{excelResultMsg.text}</span>
              </div>
            )}

            {/* Area Unggah File */}
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-2 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/30">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih File Excel / CSV</span>
              </label>
              <p className="text-[11px] text-zinc-500">
                Format file didukung: <span className="font-mono">.xlsx</span>, <span className="font-mono">.xls</span>, <span className="font-mono">.csv</span>.
              </p>
              <p className="text-[10px] text-zinc-400">
                Header kolom Excel: <strong>nama</strong>, <strong>nim</strong>, <strong>kelas</strong> (Reg/NonReg/Manaj/Dosen, default: Reg), dan <strong>kode_voting</strong> (opsional).
              </p>
            </div>

            {/* Preview Tabel Data yang Terbaca */}
            <div className="flex-1 overflow-y-auto space-y-2 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-3 bg-zinc-50 dark:bg-zinc-900/40 min-h-[160px]">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold px-1">
                <span>Data Terbaca ({excelRows.length} baris)</span>
                {excelFileName && <span className="font-mono text-[10px] truncate max-w-xs">{excelFileName}</span>}
              </div>

              {excelRows.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  Belum ada berkas yang dipilih atau data tidak terbaca.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <tr>
                        <th className="py-2 px-3">No</th>
                        <th className="py-2 px-3">Nama Mahasiswa</th>
                        <th className="py-2 px-3">NIM</th>
                        <th className="py-2 px-3">Kelas</th>
                        <th className="py-2 px-3">Kode Voting</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800 font-mono text-[11px]">
                      {excelRows.slice(0, 50).map((row, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-3">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                            {row.nama_mhs}
                          </td>
                          <td className="py-1.5 px-3">{row.nim}</td>
                          <td className="py-1.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">
                            {row.kelas}
                          </td>
                          <td className="py-1.5 px-3 text-zinc-800 dark:text-zinc-200">
                            {row.kode_voting || '(Auto Generate)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelRows.length > 50 && (
                    <p className="text-[10px] text-zinc-400 text-center py-2">
                      Menampilkan 50 baris pertama dari {excelRows.length} data.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Aksi Impor */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setExcelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleImportExcel}
                disabled={excelRows.length === 0 || excelImporting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {excelImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Impor...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Impor ke Database ({excelRows.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
