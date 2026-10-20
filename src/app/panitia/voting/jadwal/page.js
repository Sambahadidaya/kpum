'use client';

import { useState, useEffect } from 'react';
import {
  getPanitiaJadwalVotingList,
  tambahJadwalVoting,
  updateJadwalVoting,
  hapusJadwalVoting,
} from '@/api/panitia/jadwalVoting';
import { formatWaktuIndo } from '@/utils/dateUtils';
import {
  CalendarDays,
  Clock,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Timer,
  PlayCircle,
  StopCircle,
  Loader2,
} from 'lucide-react';

export default function JadwalVotingPanitiaPage() {
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    waktu_mulai: '',
    waktu_berakhir: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaJadwalVotingList();
    if (res.success) {
      setJadwalList(res.data || []);
    } else {
      setErrorText(res.error || 'Gagal memuat jadwal voting.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper konversi ISO Date ke input type="datetime-local" (format YYYY-MM-DDTHH:mm dalam waktu lokal)
  const toLocalInputValue = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const date = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${date}T${hours}:${minutes}`;
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      waktu_mulai: '',
      waktu_berakhir: '',
    });
    setErrorText('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setFormData({
      waktu_mulai: toLocalInputValue(item.waktu_mulai),
      waktu_berakhir: toLocalInputValue(item.waktu_berakhir),
    });
    setErrorText('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');

    if (!formData.waktu_mulai || !formData.waktu_berakhir) {
      setErrorText('Waktu mulai dan waktu berakhir wajib diisi.');
      return;
    }

    const startTs = new Date(formData.waktu_mulai).getTime();
    const endTs = new Date(formData.waktu_berakhir).getTime();

    if (startTs >= endTs) {
      setErrorText('Waktu mulai harus lebih awal daripada waktu berakhir.');
      return;
    }

    setSubmitting(true);
    let res;
    if (editId) {
      res = await updateJadwalVoting({
        id: editId,
        waktu_mulai: formData.waktu_mulai,
        waktu_berakhir: formData.waktu_berakhir,
      });
    } else {
      res = await tambahJadwalVoting({
        waktu_mulai: formData.waktu_mulai,
        waktu_berakhir: formData.waktu_berakhir,
      });
    }

    setSubmitting(false);

    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      setErrorText(res.error || 'Gagal menyimpan jadwal voting.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus jadwal voting ini? Pastikan tidak ada proses voting aktif yang terganggu.')) {
      const res = await hapusJadwalVoting(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus jadwal voting.');
      }
    }
  };

  // Status perhitungan jadwal saat ini
  const getJadwalStatus = (start, end) => {
    const now = Date.now();
    const startTs = new Date(start).getTime();
    const endTs = new Date(end).getTime();

    if (now < startTs) {
      return {
        label: 'Akan Datang',
        badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
        icon: Clock,
      };
    } else if (now >= startTs && now <= endTs) {
      return {
        label: 'Sedang Berlangsung',
        badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 animate-pulse',
        icon: PlayCircle,
      };
    } else {
      return {
        label: 'Telah Selesai',
        badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
        icon: StopCircle,
      };
    }
  };

  // Hitung durasi jam/menit
  const getDurasi = (start, end) => {
    const startTs = new Date(start).getTime();
    const endTs = new Date(end).getTime();
    const diffMs = endTs - startTs;
    if (isNaN(diffMs) || diffMs <= 0) return '-';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0 && minutes > 0) return `${hours} jam ${minutes} menit`;
    if (hours > 0) return `${hours} jam`;
    return `${minutes} menit`;
  };

  // Jadwal aktif terkini (jadwal paling baru)
  const activeJadwal = jadwalList[0] || null;
  const activeStatus = activeJadwal
    ? getJadwalStatus(activeJadwal.waktu_mulai, activeJadwal.waktu_berakhir)
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Halaman (Netral) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Pengaturan Jadwal E-Voting
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              Bilik Suara
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Atur rentang waktu pembukaan dan penutupan bilik suara elektronik. Sistem akan membatasi login pemilih sesuai jadwal resmi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            title="Perbarui Data"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Atur Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Jadwal Terkini */}
      {activeJadwal && activeStatus && (
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                <Timer className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Jadwal Voting Terkini
              </h2>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${activeStatus.badge}`}
            >
              <activeStatus.icon className="w-3.5 h-3.5" />
              <span>{activeStatus.label}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                Waktu Mulai (WIB)
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1 block">
                {formatWaktuIndo(activeJadwal.waktu_mulai)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                Waktu Berakhir (WIB)
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1 block">
                {formatWaktuIndo(activeJadwal.waktu_berakhir)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                Total Durasi Pemungutan
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1 block">
                {getDurasi(activeJadwal.waktu_mulai, activeJadwal.waktu_berakhir)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabel Riwayat Jadwal */}
      <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Daftar Periode Jadwal Voting
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {jadwalList.length} Jadwal Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold text-center w-12">No</th>
                <th className="py-3 px-4 font-semibold">Waktu Mulai (WIB)</th>
                <th className="py-3 px-4 font-semibold">Waktu Berakhir (WIB)</th>
                <th className="py-3 px-4 font-semibold">Durasi</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-500" />
                    Memuat data jadwal voting...
                  </td>
                </tr>
              ) : jadwalList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400">
                    Belum ada jadwal voting yang ditentukan. Klik tombol &ldquo;Atur Jadwal Baru&rdquo; di atas.
                  </td>
                </tr>
              ) : (
                jadwalList.map((item, idx) => {
                  const statusInfo = getJadwalStatus(item.waktu_mulai, item.waktu_berakhir);
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {formatWaktuIndo(item.waktu_mulai)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {formatWaktuIndo(item.waktu_berakhir)}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 font-mono">
                        {getDurasi(item.waktu_mulai, item.waktu_berakhir)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusInfo.badge}`}
                        >
                          <statusInfo.icon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Jadwal"
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Hapus Jadwal"
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
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
      </div>

      {/* Modal Tambah/Edit Jadwal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {editId ? 'Ubah Periode Jadwal Voting' : 'Tambah Periode Jadwal Voting'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorText && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Waktu Mulai Voting (WIB)
                </label>
                <input
                  type="datetime-local"
                  value={formData.waktu_mulai}
                  onChange={(e) => setFormData((prev) => ({ ...prev, waktu_mulai: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Waktu Berakhir Voting (WIB)
                </label>
                <input
                  type="datetime-local"
                  value={formData.waktu_berakhir}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, waktu_berakhir: e.target.value }))
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
                />
              </div>

              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                Waktu yang Anda masukkan akan menjadi batas aktif bilik suara mahasiswa. Pastikan waktu mulai mendahului waktu selesai.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editId ? 'Perbarui Jadwal' : 'Simpan Jadwal'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
