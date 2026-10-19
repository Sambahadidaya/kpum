'use client';

import { useState, useEffect } from 'react';
import {
  getPanitiaJadwalList,
  simpanJadwalAcara,
  hapusJadwalAcara,
} from '@/api/panitia/jadwal';
import { formatWaktuIndo } from '@/utils/dateUtils';
import {
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function PanitiaJadwalPage() {
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ success: null, text: '' });

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    judul_acara: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    lokasi: '',
    deskripsi: '',
    status: 'akan_datang',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaJadwalList();
    if (res.success) {
      setJadwalList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (jadwal = null) => {
    setStatusMsg({ success: null, text: '' });
    if (jadwal) {
      // Format tanggal ke input datetime-local format (YYYY-MM-DDTHH:mm)
      const formatForInput = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      };

      setFormData({
        id: jadwal.id,
        judul_acara: jadwal.judul_acara || '',
        tanggal_mulai: formatForInput(jadwal.tanggal_mulai),
        tanggal_selesai: formatForInput(jadwal.tanggal_selesai),
        lokasi: jadwal.lokasi || '',
        deskripsi: jadwal.deskripsi || '',
        status: jadwal.status || 'akan_datang',
      });
    } else {
      setFormData({
        id: null,
        judul_acara: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        lokasi: '',
        deskripsi: '',
        status: 'akan_datang',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ success: null, text: '' });

    const payload = {
      ...formData,
      tanggal_mulai: formData.tanggal_mulai ? new Date(formData.tanggal_mulai).toISOString() : null,
      tanggal_selesai: formData.tanggal_selesai ? new Date(formData.tanggal_selesai).toISOString() : null,
    };

    const res = await simpanJadwalAcara(payload);
    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      setStatusMsg({ success: false, text: res.error || 'Gagal menyimpan jadwal acara.' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, judul) => {
    if (confirm(`Apakah Anda yakin ingin menghapus agenda "${judul}"?`)) {
      const res = await hapusJadwalAcara(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus jadwal.');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'berlangsung':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px] font-bold">
            Sedang Berlangsung
          </span>
        );
      case 'selesai':
        return (
          <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold">
            Selesai
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[10px] font-bold">
            Akan Datang
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Manajemen Jadwal Acara Pemilu
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Susun dan publikasikan agenda tahapan pemilu raya, sosialisasi, pendaftaran, hingga hari pemungutan suara.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Acara</span>
        </button>
      </div>

      {/* Jadwal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : jadwalList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3">
          <CalendarDays className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Agenda Terdaftar</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Klik tombol Tambah Jadwal Acara untuk menambahkan agenda kegiatan pemilu baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jadwalList.map((j) => (
            <div
              key={j.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(j.status)}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openModal(j)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(j.id, j.judul_acara)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {j.judul_acara}
                </h3>

                <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>
                      {j.tanggal_mulai ? formatWaktuIndo(j.tanggal_mulai) : 'Waktu menyusul'}
                    </span>
                  </div>

                  {j.lokasi && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{j.lokasi}</span>
                    </div>
                  )}
                </div>

                {j.deskripsi && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed pt-1">
                    {j.deskripsi}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono">
                ID: {j.id.slice(0, 8)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Jadwal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {formData.id ? 'Edit Agenda Acara' : 'Tambah Agenda Acara Baru'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg.text && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Judul Agenda Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={formData.judul_acara}
                  onChange={(e) => setFormData({ ...formData, judul_acara: e.target.value })}
                  placeholder="Contoh: Debat Terbuka Pasangan Calon Presma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Tanggal & Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Tanggal & Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    value={formData.tanggal_selesai}
                    onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Lokasi / Tempat</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    placeholder="Contoh: Aula Kampus LP3I Lt. 3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Status Pelaksanaan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    <option value="akan_datang">Akan Datang</option>
                    <option value="berlangsung">Sedang Berlangsung</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Deskripsi / Detail Acara</label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Keterangan singkat mengenai agenda kegiatan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-950 py-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 disabled:opacity-50 font-bold transition shadow-xs cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
