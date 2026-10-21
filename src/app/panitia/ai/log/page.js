'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAiLogs,
  hapusAiLogById,
  hapusSemuaAiLog,
  hapusAiLogPerTanggal,
  hapusAiLogLebihLamaDari,
} from '@/api/panitia/ai';
import { formatWaktuIndo } from '@/utils/dateUtils';
import {
  History,
  Trash2,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  Zap,
  Bot,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function PanitiaAiLogPage() {
  const [logs, setLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Interval hari untuk pembersihan berkala
  const [manualInterval, setManualInterval] = useState(7);

  // Modal Detail Log
  const [selectedLog, setSelectedLog] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await getAiLogs({
      limit: pageSize,
      page: currentPage,
      status: statusFilter,
      search: searchQuery,
      date: filterDate,
    });

    if (res.success) {
      setLogs(res.data || []);
      setTotalRecords(res.count || 0);
    }
    setLoading(false);
  }, [currentPage, statusFilter, searchQuery, filterDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler Hapus Single Log
  const handleHapusSingle = async (id, e) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus catatan riwayat AI ini?')) {
      setActionLoading(true);
      const res = await hapusAiLogById(id);
      if (res.success) {
        alert(res.message);
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus log.');
      }
      setActionLoading(false);
    }
  };

  // Handler Hapus Semua (Reset Total)
  const handleHapusSemua = async () => {
    if (
      confirm(
        'PERINGATAN KERAS: Apakah Anda yakin ingin MENGHAPUS SELURUH riwayat log percakapan AI? Seluruh data analitik log akan hilang dan tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      setActionLoading(true);
      const res = await hapusSemuaAiLog();
      if (res.success) {
        alert(res.message);
        setCurrentPage(1);
        loadData();
      } else {
        alert(res.error || 'Gagal membersihkan log.');
      }
      setActionLoading(false);
    }
  };

  // Handler Hapus Per Tanggal
  const handleHapusPerTanggal = async () => {
    if (!filterDate) {
      alert('Silakan pilih tanggal terlebih dahulu pada kolom filter tanggal.');
      return;
    }
    if (confirm(`Hapus seluruh catatan riwayat AI pada tanggal ${filterDate}?`)) {
      setActionLoading(true);
      const res = await hapusAiLogPerTanggal(filterDate);
      if (res.success) {
        alert(res.message);
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus data log per tanggal.');
      }
      setActionLoading(false);
    }
  };

  // Handler Pembersihan Log Lama
  const handleCleanInterval = async () => {
    if (
      confirm(
        `Bersihkan seluruh catatan riwayat AI yang lebih lama dari ${manualInterval} hari yang lalu?`
      )
    ) {
      setActionLoading(true);
      const res = await hapusAiLogLebihLamaDari(manualInterval);
      if (res.success) {
        alert(res.message);
        loadData();
      } else {
        alert(res.error || 'Gagal membersihkan data.');
      }
      setActionLoading(false);
    }
  };

  const handleResetFilter = () => {
    setFilterDate('');
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* =====================================================================
          HEADER SECTION
         ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Log Riwayat AI Chatbot
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pantau seluruh riwayat pertanyaan mahasiswa, latensi respon, penggunaan token, dan kelola arsip data AI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={loadData}
            disabled={loading || actionLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          CONTROL BAR: FILTER & PEMBERSIHAN DATA (MIRIP /panitia/trafik)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Kolom Kiri: Filter Query (Pencarian, Tanggal, Status) */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Filter Riwayat Percakapan</span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500">
              Total: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{totalRecords}</strong> data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Input Tanggal */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Pilih Tanggal:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Status Jawaban:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="s">Berhasil Dijawab (Success)</option>
                <option value="r">Ditolak Aturan (Rejected)</option>
                <option value="e">Kegagalan Sistem (Error)</option>
              </select>
            </div>

            {/* Search Input Pertanyaan */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Cari Kata Kunci:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik pertanyaan..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {(filterDate || statusFilter !== 'all' || searchQuery) && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Aksi Pembersihan & Reset (Format Trafik) */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 text-xs font-bold text-red-600 dark:text-red-400">
            <Trash2 className="w-4 h-4" />
            <span>Manajemen Pembersihan Data</span>
          </div>

          <div className="space-y-2">
            {/* Hapus Per Tanggal */}
            {filterDate && (
              <button
                type="button"
                onClick={handleHapusPerTanggal}
                disabled={actionLoading}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>Hapus Log Tanggal {filterDate}</span>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Hapus Data Lebih Lama Dari */}
            <div className="flex items-center gap-1.5">
              <select
                value={manualInterval}
                onChange={(e) => setManualInterval(Number(e.target.value))}
                className="px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              >
                <option value={7}>&gt; 7 Hari</option>
                <option value={14}>&gt; 14 Hari</option>
                <option value={30}>&gt; 30 Hari</option>
                <option value={60}>&gt; 60 Hari</option>
              </select>
              <button
                type="button"
                onClick={handleCleanInterval}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>Bersihkan Data Lama</span>
              </button>
            </div>

            {/* Hapus Semua Data (Reset Total) */}
            <button
              type="button"
              onClick={handleHapusSemua}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Reset & Hapus Semua Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          TABEL LOG RIWAYAT
         ===================================================================== */}
      <div className="rounded-3xl bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Pertanyaan Mahasiswa</th>
                <th className="py-3.5 px-4">Status & FAQ</th>
                <th className="py-3.5 px-4">Tokens</th>
                <th className="py-3.5 px-4">Waktu Proses</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Memuat catatan riwayat percakapan...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-2 text-zinc-400">
                      <History className="w-6 h-6" />
                    </div>
                    <p className="font-semibold">Tidak ada riwayat log yang sesuai.</p>
                    <p className="text-[11px] text-zinc-400">
                      Coba sesuaikan kata kunci pencarian atau bersihkan filter.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === 's';
                  const isRejected = log.status === 'r';
                  const isError = log.status === 'e';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group"
                    >
                      {/* Waktu */}
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                        {formatWaktuIndo(log.created_at)}
                      </td>

                      {/* Pertanyaan */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {log.pertanyaan || '-'}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono truncate">
                          Sesi: {log.session_id ? log.session_id.slice(0, 12) : '-'} • IP: {log.ip_address || '-'}
                        </p>
                      </td>

                      {/* Status & FAQ Match */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Berhasil</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Ditolak</span>
                            </span>
                          )}
                          {isError && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 text-[10px] font-bold">
                              <XCircle className="w-3 h-3" />
                              <span>Error</span>
                            </span>
                          )}

                          {log.matched_faq ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>FAQ Match</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400">Generative</span>
                          )}
                        </div>
                      </td>

                      {/* Tokens */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                        <span>{log.total_tokens || 0}</span>
                        <span className="text-[10px] text-zinc-400 block">
                          in: {log.tokens_input || 0} • out: {log.tokens_output || 0}
                        </span>
                      </td>

                      {/* Processing Time */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{log.processing_ms ? `${log.processing_ms} ms` : '-'}</span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                            title="Buka Detail Log"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleHapusSingle(log.id, e)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition"
                            title="Hapus Log Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Halaman <strong className="text-zinc-900 dark:text-zinc-100">{currentPage}</strong> dari{' '}
            <strong className="text-zinc-900 dark:text-zinc-100">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODAL DETAIL LOG PERCAKAPAN
         ===================================================================== */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Rincian Log Interaksi AI
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    ID: {selectedLog.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrik Teknis Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Status:</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">
                  {selectedLog.status === 's'
                    ? 'Berhasil (s)'
                    : selectedLog.status === 'r'
                    ? 'Ditolak (r)'
                    : 'Error (e)'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Waktu Proses:</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {selectedLog.processing_ms || 0} ms
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Total Tokens:</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {selectedLog.total_tokens || 0}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">FAQ Match:</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">
                  {selectedLog.matched_faq ? 'Ya (Sesuai FAQ)' : 'Tidak (Generative)'}
                </p>
              </div>
            </div>

            {/* Pertanyaan */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Pertanyaan Pengguna:
              </label>
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed">
                {selectedLog.pertanyaan || '-'}
              </div>
            </div>

            {/* Jawaban AI */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Respon / Jawaban Sams Asisten:
              </label>
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-zinc-900/80 border border-blue-200/60 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedLog.jawaban || (
                  <span className="italic text-zinc-400">Tidak ada respon teks atau error terjadi.</span>
                )}
              </div>
            </div>

            {/* Pesan Error (jika ada) */}
            {selectedLog.error_msg && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                  Catatan Kesalahan Teknis (Error Log):
                </label>
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-mono">
                  {selectedLog.error_msg}
                </div>
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={(e) => {
                  handleHapusSingle(selectedLog.id, e);
                  setSelectedLog(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Log Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-xs font-bold transition cursor-pointer"
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
