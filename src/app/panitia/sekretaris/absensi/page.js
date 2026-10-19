'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  getAbsensiPageData,
  simpanBulkAbsensi,
} from '@/api/panitia/absensi';
import {
  UserCheck,
  Save,
  Filter,
  Check,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  MessageSquare,
  X,
  AlertCircle,
} from 'lucide-react';
import { formatWaktuIndo } from '@/utils/dateUtils';

const STORAGE_KEY = 'panitia_sekretaris_absensi_data';

// Opsi Jenis Kehadiran
const JENIS_OPTIONS = [
  { value: 'belum_absen', label: 'Belum Absen', color: 'text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' },
  { value: 'hadir', label: 'Hadir', color: 'text-blue-600 dark:text-blue-400 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' },
  { value: 'izin', label: 'Izin', color: 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' },
  { value: 'sakit', label: 'Sakit', color: 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' },
  { value: 'alpha', label: 'Alpha', color: 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' },
];

// Opsi Keterlambatan
const KETERLAMBATAN_OPTIONS = [
  { value: 'belum_absen', label: 'Belum Absen' },
  { value: 'tepat_waktu', label: 'Tepat Waktu' },
  { value: 'terlambat', label: 'Terlambat' },
  { value: 'tidak hadir', label: 'Tidak Hadir' },
];

// Opsi Filter Status Absensi
const STATUS_FILTER_OPTIONS = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'sudah', label: 'Sudah Absensi' },
  { value: 'belum', label: 'Belum Absensi' },
];

export default function AbsensiPanitiaPage() {
  const [judulList, setJudulList] = useState([]);
  const [panitiaList, setPanitiaList] = useState([]);
  const [absensiList, setAbsensiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter judul absensi di atas tabel (default kosong)
  const [selectedJudulId, setSelectedJudulId] = useState('');

  // Local rows yang dapat diedit langsung dalam tabel
  const [tableRows, setTableRows] = useState([]);
  const [initialRowsSnapshot, setInitialRowsSnapshot] = useState('');

  // Filter & Search dalam tabel
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // State Penyimpanan
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal Mini Input Keterangan
  const [keteranganModal, setKeteranganModal] = useState({
    isOpen: false,
    panitiaId: null,
    namaPanitia: '',
    text: '',
  });

  // 1 Query GET saat inisialisasi + simpan ke localStorage
  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.judulList) {
              setJudulList(parsed.judulList || []);
              setPanitiaList(parsed.panitiaList || []);
              setAbsensiList(parsed.absensiList || []);
              setLoading(false);
            }
          } catch (e) {}
        }
      }

      const res = await getAbsensiPageData();
      if (res.success && res.data) {
        setJudulList(res.data.judulList || []);
        setPanitiaList(res.data.panitiaList || []);
        setAbsensiList(res.data.absensiList || []);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data absensi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync rows saat selectedJudulId berubah atau absensiList diperbarui
  useEffect(() => {
    if (!selectedJudulId) {
      setTableRows([]);
      setInitialRowsSnapshot('');
      return;
    }

    const currentAbsenList = absensiList.filter(
      (a) => a.judul_absensi_panitia_id === selectedJudulId
    );

    const rows = panitiaList.map((panitia) => {
      const existing = currentAbsenList.find((a) => a.panitia_id === panitia.id);
      return {
        panitia_id: panitia.id,
        nama_panitia: panitia.nama_panitia,
        jabatan_panitia: panitia.jabatan_panitia || '-',
        prodi_panitia: panitia.prodi_panitia || '',
        foto_panitia: panitia.foto_panitia || '',
        absensi_id: existing?.id || null,
        jenis_absensi: existing?.jenis_absensi || 'belum_absen',
        keterlambatan: existing?.keterlambatan || 'belum_absen',
        keterangan: existing?.keterangan || '',
        created_at: existing?.created_at || null,
      };
    });

    setTableRows(rows);
    setInitialRowsSnapshot(JSON.stringify(rows));
  }, [selectedJudulId, panitiaList, absensiList]);

  // Cek apakah ada perubahan belum disimpan
  const hasUnsavedChanges = useMemo(() => {
    if (!selectedJudulId || !initialRowsSnapshot) return false;
    return JSON.stringify(tableRows) !== initialRowsSnapshot;
  }, [tableRows, initialRowsSnapshot, selectedJudulId]);

  // Peringatan sebelum keluar browser (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Ada data absensi yang belum disimpan. Yakin ingin keluar?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle pergantian judul absensi dengan konfirmasi jika belum disave
  const handleSelectJudul = (judulId) => {
    if (hasUnsavedChanges) {
      const confirmLeave = confirm(
        'Ada perubahan data absensi yang belum disimpan. Jika berpindah agenda, perubahan akan hilang. Lanjutkan?'
      );
      if (!confirmLeave) return;
    }
    setSelectedJudulId(judulId);
    setSearchQuery('');
    setStatusFilter('semua');
    setSaveSuccessMsg('');
    setErrorMsg('');
  };

  // Close filter dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update Jenis Kehadiran per Baris
  const handleUpdateJenis = (panitiaId, newJenis) => {
    setTableRows((prev) =>
      prev.map((row) => {
        if (row.panitia_id !== panitiaId) return row;
        let newKeterlambatan = row.keterlambatan;
        if (newJenis === 'belum_absen') {
          newKeterlambatan = 'belum_absen';
        } else if (newJenis === 'hadir') {
          // Jika diubah menjadi hadir, bila sebelumnya 'tidak hadir' atau 'belum_absen', default ke 'tepat_waktu'
          if (row.keterlambatan === 'tidak hadir' || row.keterlambatan === 'belum_absen') {
            newKeterlambatan = 'tepat_waktu';
          }
        } else {
          // Jika selain hadir (izin, sakit, alpha), otomatis terisi 'tidak hadir'
          newKeterlambatan = 'tidak hadir';
        }
        return {
          ...row,
          jenis_absensi: newJenis,
          keterlambatan: newKeterlambatan,
        };
      })
    );
  };

  // Update Keterlambatan per Baris
  const handleUpdateKeterlambatan = (panitiaId, newKeterlambatan) => {
    setTableRows((prev) =>
      prev.map((row) => {
        if (row.panitia_id !== panitiaId) return row;
        return {
          ...row,
          keterlambatan: newKeterlambatan,
        };
      })
    );
  };

  // Buka Modal Keterangan
  const openKeteranganModal = (row) => {
    setKeteranganModal({
      isOpen: true,
      panitiaId: row.panitia_id,
      namaPanitia: row.nama_panitia,
      text: row.keterangan || '',
    });
  };

  // Simpan Keterangan ke Baris
  const handleSaveKeterangan = (e) => {
    e.preventDefault();
    if (!keteranganModal.panitiaId) return;

    setTableRows((prev) =>
      prev.map((row) => {
        if (row.panitia_id !== keteranganModal.panitiaId) return row;
        return {
          ...row,
          keterangan: keteranganModal.text.trim(),
        };
      })
    );
    setKeteranganModal({ isOpen: false, panitiaId: null, namaPanitia: '', text: '' });
  };

  // Simpan Seluruh Perubahan ke Database (Bulk Save)
  const handleSaveAll = async () => {
    if (!selectedJudulId) return;
    setSaving(true);
    setErrorMsg('');
    setSaveSuccessMsg('');

    try {
      const itemsToSave = tableRows.map((r) => ({
        panitia_id: r.panitia_id,
        absensi_id: r.absensi_id,
        jenis_absensi: r.jenis_absensi,
        keterlambatan: r.keterlambatan,
        keterangan: r.keterangan,
      }));

      const res = await simpanBulkAbsensi(selectedJudulId, itemsToSave);
      if (res.success && res.data) {
        // Update master absensiList
        const updatedAbsensiList = [
          ...absensiList.filter((a) => a.judul_absensi_panitia_id !== selectedJudulId),
          ...res.data,
        ];

        setAbsensiList(updatedAbsensiList);

        // Update localStorage
        if (typeof window !== 'undefined') {
          const payload = {
            judulList,
            panitiaList,
            absensiList: updatedAbsensiList,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }

        // Update snap shot
        const newRows = tableRows.map((r) => {
          const savedItem = res.data.find((d) => d.panitia_id === r.panitia_id);
          return {
            ...r,
            absensi_id: savedItem?.id || null,
            created_at: savedItem?.created_at || (r.jenis_absensi !== 'belum_absen' ? new Date().toISOString() : null),
          };
        });

        setTableRows(newRows);
        setInitialRowsSnapshot(JSON.stringify(newRows));
        setSaveSuccessMsg('Seluruh perubahan data absensi berhasil disimpan!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan data absensi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  // Hitung Header Statistik (Sudah Absensi vs Belum Absensi)
  const summaryHeader = useMemo(() => {
    const totalPanitia = tableRows.length;
    let sudahAbsensi = 0;
    let belumAbsensi = 0;
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;

    tableRows.forEach((row) => {
      if (row.jenis_absensi && row.jenis_absensi !== 'belum_absen') {
        sudahAbsensi++;
        if (row.jenis_absensi === 'hadir') hadir++;
        else if (row.jenis_absensi === 'izin') izin++;
        else if (row.jenis_absensi === 'sakit') sakit++;
        else if (row.jenis_absensi === 'alpha') alpha++;
      } else {
        belumAbsensi++;
      }
    });

    return {
      totalPanitia,
      sudahAbsensi,
      belumAbsensi,
      hadir,
      izin,
      sakit,
      alpha,
    };
  }, [tableRows]);

  // Data Terfilter untuk Tabel (Pencarian nama & Filter status sudah/belum)
  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      // 1. Filter Status Absensi
      if (statusFilter === 'sudah' && row.jenis_absensi === 'belum_absen') {
        return false;
      }
      if (statusFilter === 'belum' && row.jenis_absensi !== 'belum_absen') {
        return false;
      }

      // 2. Filter Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nama = row.nama_panitia?.toLowerCase() || '';
        const jabatan = row.jabatan_panitia?.toLowerCase() || '';
        const ket = row.keterangan?.toLowerCase() || '';
        return nama.includes(q) || jabatan.includes(q) || ket.includes(q);
      }

      return true;
    });
  }, [tableRows, statusFilter, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Absensi Panitia
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              Sekretaris
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pencatatan kehadiran seluruh panitia secara langsung dalam tabel dengan penyimpanan menyeluruh.
          </p>
        </div>

        {/* Tombol Save Data Absensi (Hanya jika judul sudah dipilih) */}
        {selectedJudulId && (
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Ada perubahan belum disimpan
              </span>
            )}
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950'
              }`}
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Menyimpan...' : 'Save Data Absensi'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Pesan Sukses / Error Notifikasi */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg('')} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pilihan Judul Absensi (Wajib Dipilih) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Pilih Judul Absensi Kegiatan:
            </label>
          </div>
          {selectedJudulId && (
            <button
              onClick={() => handleSelectJudul('')}
              className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline cursor-pointer"
            >
              Reset Pilihan
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={selectedJudulId}
            onChange={(e) => handleSelectJudul(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">-- Pilih Judul Absensi untuk Menampilkan Seluruh Panitia --</option>
            {judulList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.judul_absensi_panitia}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tampilan Jika Belum Memilih Filter Judul */}
      {!selectedJudulId ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Pilih Judul Absensi Terlebih Dahulu
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Setelah memilih agenda judul absensi, seluruh panitia akan langsung dimunculkan dalam tabel untuk dapat diabsen secara langsung.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* HEADER BARU: Status Sudah vs Belum Absensi & Rekap Akumulasi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Sudah Absensi */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Sudah Absensi</p>
                <p className="text-base font-black text-blue-600 dark:text-blue-400">
                  {summaryHeader.sudahAbsensi} <span className="text-[10px] font-normal text-zinc-400">/{summaryHeader.totalPanitia}</span>
                </p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. Belum Absensi */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Belum Absensi</p>
                <p className="text-base font-black text-zinc-700 dark:text-zinc-300">
                  {summaryHeader.belumAbsensi} <span className="text-[10px] font-normal text-zinc-400">Orang</span>
                </p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3. Hadir */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Hadir</p>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-100">{summaryHeader.hadir}</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* 4. Izin */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Izin</p>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-100">{summaryHeader.izin}</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 5. Sakit */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Sakit</p>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-100">{summaryHeader.sakit}</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 6. Alpha */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Alpha</p>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-100">{summaryHeader.alpha}</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Bar Kontrol: Search & Filter Dropdown UL LI */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Dropdown Filter UL LI: Status Absensi */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  type="button"
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs cursor-pointer min-w-44"
                >
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>
                      {STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label || 'Filter Status'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {filterDropdownOpen && (
                  <ul className="absolute left-0 mt-1 z-30 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 text-xs divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {STATUS_FILTER_OPTIONS.map((opt) => (
                      <li
                        key={opt.value}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setFilterDropdownOpen(false);
                        }}
                        className={`px-3.5 py-2 cursor-pointer flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition ${
                          statusFilter === opt.value
                            ? 'font-bold text-blue-600 dark:text-blue-400 bg-zinc-50 dark:bg-zinc-900'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {statusFilter === opt.value && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Search Panitia */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama panitia..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="text-xs text-zinc-500 self-end sm:self-auto">
              Menampilkan: <strong className="text-zinc-900 dark:text-zinc-100">{filteredRows.length}</strong> Panitia
            </div>
          </div>

          {/* TABEL SELURUH PANITIA DENGAN INLINE EDITING */}
          {filteredRows.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <UserCheck className="w-8 h-8 mx-auto text-zinc-400" />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Tidak ada data panitia yang cocok dengan filter saat ini.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-visible shadow-xs hover:shadow-lg transition-all">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold w-10 text-center">No</th>
                      <th className="py-3.5 px-4 font-semibold">Nama Panitia</th>
                      <th className="py-3.5 px-4 font-semibold">Jabatan</th>
                      <th className="py-3.5 px-4 font-semibold">Jenis Kehadiran</th>
                      <th className="py-3.5 px-4 font-semibold">Keterlambatan</th>
                      <th className="py-3.5 px-4 font-semibold">Keterangan</th>
                      <th className="py-3.5 px-4 font-semibold">Waktu Tercatat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                    {filteredRows.map((row, index) => (
                      <InlineTableRow
                        key={row.panitia_id}
                        row={row}
                        index={index}
                        onUpdateJenis={handleUpdateJenis}
                        onUpdateKeterlambatan={handleUpdateKeterlambatan}
                        onOpenKeterangan={openKeteranganModal}
                      />
                    ))}
                  </tbody>
                  {/* Ujung Row Summary Rekapitulasi */}
                  <tfoot className="bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4">
                        <span className="text-[11px] text-zinc-500 font-normal">
                          Total Panitia:
                        </span>{' '}
                        <span className="font-bold">{summaryHeader.totalPanitia} Orang</span>
                        <span className="text-zinc-400 text-[11px] ml-2">
                          (Sudah: {summaryHeader.sudahAbsensi} | Belum: {summaryHeader.belumAbsensi})
                        </span>
                      </td>
                      <td colSpan={4} className="py-3.5 px-4 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-3 text-[11px]">
                          <span>
                            Hadir: <strong className="text-blue-600 dark:text-blue-400 font-bold">{summaryHeader.hadir}</strong>
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span>
                            Izin: <strong>{summaryHeader.izin}</strong>
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span>
                            Sakit: <strong>{summaryHeader.sakit}</strong>
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span>
                            Alpha: <strong>{summaryHeader.alpha}</strong>
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL MINI INPUT KETERANGAN */}
      {keteranganModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Keterangan Absensi Panitia
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">{keteranganModal.namaPanitia}</p>
              </div>
              <button
                onClick={() => setKeteranganModal({ isOpen: false, panitiaId: null, namaPanitia: '', text: '' })}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKeterangan} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Tulis Keterangan / Alasan:
                </label>
                <textarea
                  rows={3}
                  value={keteranganModal.text}
                  onChange={(e) => setKeteranganModal({ ...keteranganModal, text: e.target.value })}
                  placeholder="Contoh: Izin tugas luar kampus, Sakit demam berdarah..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500 resize-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setKeteranganModal({ isOpen: false, panitiaId: null, namaPanitia: '', text: '' })}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold shadow-xs cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Komponen Baris Tabel dengan Dropdown UL LI Inline
 */
function InlineTableRow({ row, index, onUpdateJenis, onUpdateKeterlambatan, onOpenKeterangan }) {
  const [jenisDropdownOpen, setJenisDropdownOpen] = useState(false);
  const [keterlambatanDropdownOpen, setKeterlambatanDropdownOpen] = useState(false);

  const jenisRef = useRef(null);
  const keterlambatanRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (jenisRef.current && !jenisRef.current.contains(e.target)) {
        setJenisDropdownOpen(false);
      }
      if (keterlambatanRef.current && !keterlambatanRef.current.contains(e.target)) {
        setKeterlambatanDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentJenisOpt =
    JENIS_OPTIONS.find((o) => o.value === row.jenis_absensi) || JENIS_OPTIONS[0];

  const currentKeterlambatanOpt =
    KETERLAMBATAN_OPTIONS.find((o) => o.value === row.keterlambatan) || KETERLAMBATAN_OPTIONS[0];

  const isBelumAbsen = row.jenis_absensi === 'belum_absen';

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
      {/* No */}
      <td className="py-3 px-4 text-center font-mono text-zinc-400">
        {index + 1}
      </td>

      {/* Nama Panitia */}
      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center text-xs border border-zinc-200 dark:border-zinc-700 shrink-0">
            {row.nama_panitia?.charAt(0) || 'P'}
          </div>
          <div className="truncate max-w-xs">
            <span className="block truncate">{row.nama_panitia}</span>
            {row.prodi_panitia && (
              <span className="text-[10px] font-normal text-zinc-400 block truncate">
                {row.prodi_panitia}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Jabatan */}
      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">
        {row.jabatan_panitia}
      </td>

      {/* Jenis Kehadiran (Dropdown UL LI) */}
      <td className="py-3 px-4 relative" ref={jenisRef}>
        <button
          type="button"
          onClick={() => {
            setJenisDropdownOpen(!jenisDropdownOpen);
            setKeterlambatanDropdownOpen(false);
          }}
          className={`inline-flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition min-w-32 ${
            isBelumAbsen
              ? 'text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
              : row.jenis_absensi === 'hadir'
              ? 'text-blue-600 dark:text-blue-400 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBelumAbsen
                  ? 'bg-zinc-300 dark:bg-zinc-700'
                  : row.jenis_absensi === 'hadir'
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : 'bg-zinc-500'
              }`}
            />
            <span>{currentJenisOpt.label}</span>
          </div>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {jenisDropdownOpen && (
          <ul className="absolute left-4 top-12 z-40 w-36 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
            {JENIS_OPTIONS.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onUpdateJenis(row.panitia_id, opt.value);
                  setJenisDropdownOpen(false);
                }}
                className={`px-3 py-1.5 cursor-pointer flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition ${
                  row.jenis_absensi === opt.value
                    ? 'font-bold text-blue-600 dark:text-blue-400 bg-zinc-50 dark:bg-zinc-900'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span>{opt.label}</span>
                {row.jenis_absensi === opt.value && (
                  <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                )}
              </li>
            ))}
          </ul>
        )}
      </td>

      {/* Keterlambatan (Dropdown jika Hadir, atau Tidak Hadir / Belum Absen) */}
      <td className="py-3 px-4 relative" ref={keterlambatanRef}>
        {row.jenis_absensi === 'hadir' ? (
          <>
            <button
              type="button"
              onClick={() => {
                setKeterlambatanDropdownOpen(!keterlambatanDropdownOpen);
                setJenisDropdownOpen(false);
              }}
              className="inline-flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition min-w-32 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <span>{row.keterlambatan === 'terlambat' ? 'Terlambat' : 'Tepat Waktu'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {keterlambatanDropdownOpen && (
              <ul className="absolute left-4 top-12 z-40 w-36 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {[
                  { value: 'tepat_waktu', label: 'Tepat Waktu' },
                  { value: 'terlambat', label: 'Terlambat' },
                ].map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      onUpdateKeterlambatan(row.panitia_id, opt.value);
                      setKeterlambatanDropdownOpen(false);
                    }}
                    className={`px-3 py-1.5 cursor-pointer flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition ${
                      row.keterlambatan === opt.value
                        ? 'font-bold text-blue-600 dark:text-blue-400 bg-zinc-50 dark:bg-zinc-900'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {row.keterlambatan === opt.value && (
                      <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold border min-w-32 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/60 cursor-not-allowed">
            <span>{isBelumAbsen ? 'Belum Absen' : 'Tidak Hadir'}</span>
          </div>
        )}
      </td>

      {/* Keterangan */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 max-w-xs">
          <span className="truncate text-zinc-600 dark:text-zinc-400">
            {row.keterangan || (isBelumAbsen ? 'Belum Absen' : '-')}
          </span>
          <button
            type="button"
            onClick={() => onOpenKeterangan(row)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title="Tambah atau Ubah Keterangan"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>

      {/* Waktu Tercatat */}
      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
        {row.created_at ? formatWaktuIndo(row.created_at) : 'Belum Absen'}
      </td>
    </tr>
  );
}
