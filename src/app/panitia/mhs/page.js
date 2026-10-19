'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  getPanitiaMhsList,
  tambahMhsManual,
  tambahMhsBulk,
  updateMhs,
  hapusMhs,
} from '@/api/panitia/mhs';
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
} from 'lucide-react';

export default function PanitiaMhsPage() {
  const [mhsList, setMhsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  // Modal Tambah/Edit Manual
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nama_mhs: '',
    nim: '',
    kode_voting: '',
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

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaMhsList({ search, statusFilter });
    if (res.success) {
      setMhsList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

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
      });
    } else {
      setEditId(null);
      setFormData({
        nama_mhs: '',
        nim: '',
        kode_voting: Math.random().toString(36).substring(2, 8).toUpperCase(),
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
      loadData();
    } else {
      setErrorText(res.error || 'Gagal menyimpan data mahasiswa.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, nama) => {
    if (confirm(`Hapus data mahasiswa ${nama}? Jika sudah melakukan voting, data suara terkait juga akan terhapus.`)) {
      const res = await hapusMhs(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus data mahasiswa.');
      }
    }
  };

  // Handle pembacaan file Excel (.xlsx, .xls, .csv)
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

        // Normalize keys
        const formatted = jsonData.map((row) => ({
          nama_mhs: row.nama_mhs || row.nama || row.Nama || row['Nama Lengkap'] || '',
          nim: String(row.nim || row.NIM || row.Nim || '').trim(),
          kode_voting: String(row.kode_voting || row.kode || row.Kode || row.token || '').trim(),
        })).filter((item) => item.nama_mhs && item.nim);

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
      loadData();
    } else {
      setExcelResultMsg({
        type: 'error',
        text: res.error || 'Gagal mengimpor file Excel.',
      });
    }
    setExcelImporting(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Halaman */}
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
            Kelola Daftar Pemilih Tetap (DPT) mahasiswa Politeknik LP3I, generate kode voting, dan impor berkas Excel.
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, NIM, atau kode voting..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('semua')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === 'semua'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('belum')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === 'belum'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Belum Voting
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('sudah')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === 'sudah'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Sudah Voting
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            title="Muat Ulang Data"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabel Data Mahasiswa */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Nama Mahasiswa</th>
                  <th className="py-3.5 px-4 font-semibold">NIM</th>
                  <th className="py-3.5 px-4 font-semibold">Kode Voting</th>
                  <th className="py-3.5 px-4 font-semibold">Status Voting</th>
                  <th className="py-3.5 px-4 font-semibold">Waktu Memilih</th>
                  <th className="py-3.5 px-5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {mhsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      Tidak ada data mahasiswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  mhsList.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-5 font-bold text-zinc-900 dark:text-zinc-100">
                        {m.nama_mhs}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{m.nim}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono font-bold text-zinc-800 dark:text-zinc-200 text-[11px]">
                          {m.kode_voting}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                        {m.voting_at
                          ? new Date(m.voting_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1.5">
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

      {/* Modal Tambah / Edit Manual */}
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
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
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
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kode Token Voting
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomKode}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
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
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-blue-600 uppercase"
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

      {/* Modal Upload Excel */}
      {excelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
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
                Header kolom tabel Excel minimal memuat: <strong>nama</strong> dan <strong>nim</strong> (opsional: <strong>kode_voting</strong>).
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
                          <td className="py-1.5 px-3 text-zinc-800 dark:text-zinc-200 font-bold">
                            {row.kode_voting || '(Auto)'}
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
