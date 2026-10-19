'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getJudulAbsensiData,
  tambahJudulAbsensi,
  hapusJudulAbsensi,
} from '@/api/panitia/absensi';
import {
  ClipboardList,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Search,
  Calendar,
  Users,
} from 'lucide-react';
import { formatWaktuIndo } from '@/utils/dateUtils';

const STORAGE_KEY = 'panitia_sekretaris_judul_absensi';

export default function JudulAbsensiPanitiaPage() {
  const [judulList, setJudulList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [formData, setFormData] = useState({
    judul_absensi_panitia: '',
  });

  // 1 Query GET saat inisialisasi + simpan ke localStorage
  const loadData = async () => {
    setLoading(true);
    try {
      // Ambil cache lokal dulu jika ada
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              setJudulList(parsed);
              setLoading(false);
            }
          } catch (e) {}
        }
      }

      // 1 Query GET dari Server Action
      const res = await getJudulAbsensiData();
      if (res.success && Array.isArray(res.data)) {
        setJudulList(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data judul absensi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter client-side dari data yang ada di state / localStorage
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return judulList;
    const query = searchQuery.toLowerCase();
    return judulList.filter((item) =>
      item.judul_absensi_panitia.toLowerCase().includes(query)
    );
  }, [judulList, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');

    const judul = formData.judul_absensi_panitia.trim();
    if (!judul) {
      setErrorText('Judul absensi tidak boleh kosong.');
      setSubmitting(false);
      return;
    }

    const res = await tambahJudulAbsensi({ judul_absensi_panitia: judul });
    if (res.success && res.data) {
      const newItem = {
        id: res.data.id,
        judul_absensi_panitia: res.data.judul_absensi_panitia,
        created_at: res.data.created_at,
        total_absensi: 0,
      };

      const updated = [newItem, ...judulList];
      setJudulList(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }

      setModalOpen(false);
      setFormData({ judul_absensi_panitia: '' });
    } else {
      setErrorText(res.error || 'Gagal menambahkan judul absensi.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, namaJudul) => {
    if (
      confirm(
        `Hapus judul absensi "${namaJudul}"? Seluruh data absensi panitia pada judul ini juga akan terhapus.`
      )
    ) {
      const res = await hapusJudulAbsensi(id);
      if (res.success) {
        const updated = judulList.filter((item) => item.id !== id);
        setJudulList(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } else {
        alert(res.error || 'Gagal menghapus judul absensi.');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Judul Absensi Panitia
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              Sekretaris
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola agenda kegiatan atau rapat yang memerlukan pencatatan absensi panitia.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorText('');
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-400 dark:text-blue-600" />
          <span>Tambah Judul Absensi</span>
        </button>
      </div>

      {/* Filter / Pencarian di client */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul absensi..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-blue-500 transition"
          />
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Total: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{filteredList.length}</span> Agenda
        </div>
      </div>

      {/* Tabel Judul Absensi */}
      {loading && judulList.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <ClipboardList className="w-8 h-8 mx-auto text-zinc-400" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {searchQuery ? 'Tidak ada judul absensi yang cocok dengan pencarian.' : 'Belum ada agenda absensi panitia.'}
          </p>
          <p className="text-[11px] text-zinc-500">
            Klik tombol Tambah Judul Absensi untuk membuat sesi kehadiran baru.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-5 font-semibold w-12 text-center">No</th>
                  <th className="py-3.5 px-4 font-semibold">Judul Kegiatan / Sesi Absensi</th>
                  <th className="py-3.5 px-4 font-semibold">Tanggal Pembuatan</th>
                  <th className="py-3.5 px-4 font-semibold">Total Panitia Terabsen</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {filteredList.map((item, index) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition"
                    >
                      <td className="py-3.5 px-5 text-center font-mono text-zinc-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                            <ClipboardList className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate max-w-md">{item.judul_absensi_panitia}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{item.created_at ? formatWaktuIndo(item.created_at) : '-'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>{item.total_absensi || 0} panitia</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.judul_absensi_panitia)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                          title="Hapus Judul Absensi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Judul Absensi */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Tambah Judul Absensi Baru
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorText && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Judul Absensi / Nama Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.judul_absensi_panitia}
                  onChange={(e) =>
                    setFormData({ ...formData, judul_absensi_panitia: e.target.value })
                  }
                  placeholder="Contoh: Rapat Pleno Pemilu Raya 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[10px] text-zinc-400">
                  Tanggal pembuatan otomatis diset berdasarkan tanggal hari ini.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold shadow-xs cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
