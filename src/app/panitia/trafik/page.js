'use client';

import { useState, useEffect } from 'react';
import {
  getPanitiaTrafikData,
  hapusSemuaTrafik,
  hapusTrafikPerTanggal,
  hapusTrafikLebihLamaDari,
  simpanTrafikSetting,
} from '@/api/panitia/trafik';
import { formatWaktuIndo } from '@/utils/dateUtils';
import {
  Activity,
  Trash2,
  Calendar,
  Settings,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Check,
  Clock,
  Filter,
} from 'lucide-react';

export default function PanitiaTrafikPage() {
  const [trafikList, setTrafikList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-delete settings
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [intervalHari, setIntervalHari] = useState(7);
  const [manualInterval, setManualInterval] = useState(7);
  const [settingSavedMsg, setSettingSavedMsg] = useState('');

  const loadData = async (date = filterDate) => {
    setLoading(true);
    const res = await getPanitiaTrafikData(date || null);
    if (res.success) {
      setTrafikList(res.data || []);
      setTotalRecords(res.total || 0);
      if (res.setting) {
        setAutoDeleteEnabled(Boolean(res.setting.auto_delete_enabled));
        setIntervalHari(res.setting.interval_hari || 7);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterDate(val);
    loadData(val);
  };

  const handleResetFilter = () => {
    setFilterDate('');
    loadData('');
  };

  const handleHapusSemua = async () => {
    if (
      confirm(
        'PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SELURUH data trafik kunjungan? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      setActionLoading(true);
      const res = await hapusSemuaTrafik();
      if (res.success) {
        alert(res.message);
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus data.');
      }
      setActionLoading(false);
    }
  };

  const handleHapusPerTanggal = async () => {
    if (!filterDate) {
      alert('Silakan pilih tanggal terlebih dahulu pada kolom filter tanggal.');
      return;
    }
    if (confirm(`Hapus seluruh catatan log kunjungan pada tanggal ${filterDate}?`)) {
      setActionLoading(true);
      const res = await hapusTrafikPerTanggal(filterDate);
      if (res.success) {
        alert(res.message);
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus data per tanggal.');
      }
      setActionLoading(false);
    }
  };

  const handleManualCleanInterval = async () => {
    if (
      confirm(
        `Bersihkan seluruh data trafik yang lebih lama dari ${manualInterval} hari yang lalu?`
      )
    ) {
      setActionLoading(true);
      const res = await hapusTrafikLebihLamaDari(manualInterval);
      if (res.success) {
        alert(res.message);
        loadData();
      } else {
        alert(res.error || 'Gagal membersihkan data.');
      }
      setActionLoading(false);
    }
  };

  const handleSaveSetting = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setSettingSavedMsg('');
    const res = await simpanTrafikSetting(autoDeleteEnabled, intervalHari);
    if (res.success) {
      setSettingSavedMsg('Pengaturan auto-delete berhasil disimpan.');
      setTimeout(() => setSettingSavedMsg(''), 4000);
      loadData();
    } else {
      alert(res.error || 'Gagal menyimpan pengaturan.');
    }
    setActionLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Manajemen Data Lalu Lintas (Trafik)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Kelola, reset manual, dan atur jadwal pembersihan otomatis riwayat kunjungan agar database tetap ringan.
          </p>
        </div>

        <button
          onClick={() => loadData()}
          disabled={loading || actionLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Grid Konfigurasi & Aksi Pembersihan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Form Auto-Delete & Hapus Manual */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Pengaturan Auto-Delete */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-900 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Pembersihan Otomatis (Auto-Delete)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Jadwalkan pembersihan otomatis berkala di latar belakang
                </p>
              </div>
            </div>

            {settingSavedMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-900/60">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settingSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSetting} className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                    Mode Otomatis
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {autoDeleteEnabled ? 'Aktif (Otomatis dibersihkan)' : 'Nonaktif (Manual saja)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoDeleteEnabled(!autoDeleteEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    autoDeleteEnabled ? 'bg-blue-600 justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Interval Pembersihan Otomatis
                </label>
                <select
                  value={intervalHari}
                  onChange={(e) => setIntervalHari(parseInt(e.target.value, 10))}
                  disabled={!autoDeleteEnabled}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 focus:outline-hidden cursor-pointer"
                >
                  <option value={3}>Hapus data lebih dari 3 hari yang lalu</option>
                  <option value={5}>Hapus data lebih dari 5 hari yang lalu</option>
                  <option value={7}>Hapus data lebih dari 7 hari yang lalu (1 Pekan)</option>
                  <option value={14}>Hapus data lebih dari 14 hari yang lalu (2 Pekan)</option>
                  <option value={30}>Hapus data lebih dari 30 hari yang lalu (1 Bulan)</option>
                </select>
                <p className="text-[10px] text-zinc-500">
                  Data yang melewati batas hari di atas akan otomatis dipangkas saat sistem aktif.
                </p>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold transition shadow-xs cursor-pointer"
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </form>
          </div>

          {/* Card Pembersihan Manual */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-zinc-900 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Aksi Pembersihan Manual
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Format instan seluruh data atau berdasarkan rentang
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Bersihkan data lebih lama dari X hari */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Pangkas Riwayat Lama (Manual):
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={manualInterval}
                    onChange={(e) => setManualInterval(parseInt(e.target.value, 10))}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    <option value={3}>Lebih dari 3 hari lalu</option>
                    <option value={5}>Lebih dari 5 hari lalu</option>
                    <option value={7}>Lebih dari 7 hari lalu</option>
                    <option value={14}>Lebih dari 14 hari lalu</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleManualCleanInterval}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold transition cursor-pointer"
                  >
                    Bersihkan
                  </button>
                </div>
              </div>

              {/* Hapus Semua Data */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleHapusSemua}
                  disabled={actionLoading || totalRecords === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Format Seluruh Data Trafik (Reset)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tabel Log Trafik & Filter Per Tanggal */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card Filter Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Filter Tanggal:
              </span>
              <input
                type="date"
                value={filterDate}
                onChange={handleFilterChange}
                className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 cursor-pointer"
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {filterDate && (
              <button
                type="button"
                onClick={handleHapusPerTanggal}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Data Tanggal Ini</span>
              </button>
            )}
          </div>

          {/* Tabel Log */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Daftar Catatan Kunjungan
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                {totalRecords.toLocaleString('id-ID')} Catatan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="pb-3 font-semibold">Wilayah</th>
                    <th className="pb-3 font-semibold">ISP / Jaringan</th>
                    <th className="pb-3 font-semibold">Halaman</th>
                    <th className="pb-3 font-semibold">Sumber</th>
                    <th className="pb-3 font-semibold">Waktu Kunjungan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        Memuat data riwayat...
                      </td>
                    </tr>
                  ) : trafikList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        Tidak ada catatan trafik ditemukan.
                      </td>
                    </tr>
                  ) : (
                    trafikList.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition">
                        <td className="py-2.5 font-medium flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{log.kota || 'Indonesia'}</span>
                        </td>
                        <td className="py-2.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] truncate max-w-[140px]">
                          {log.isp || 'Lokal'}
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                          {log.path || '/'}
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                            {log.sumber || 'Direct'}
                          </span>
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
        </div>
      </div>
    </div>
  );
}
