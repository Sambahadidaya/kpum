'use client';

import { useState, useEffect } from 'react';
import {
  getPanitiaPanduanList,
  simpanPanduanBab,
  hapusPanduanBab,
  simpanIsiPanduan,
  hapusIsiPanduan,
} from '@/api/panitia/panduan';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Video,
  X,
} from 'lucide-react';

export default function PanitiaPanduanPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal Bab
  const [modalBabOpen, setModalBabOpen] = useState(false);
  const [babFormData, setBabFormData] = useState({ id: null, judul: '', urutan: 1 });

  // State Modal Sub-Isi
  const [modalSubOpen, setModalSubOpen] = useState(false);
  const [subFormData, setSubFormData] = useState({
    id: null,
    judul_panduan_id: '',
    sub_judul: '',
    isi: '',
    link_vidio: '',
    urutan: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaPanduanList();
    if (res.success) {
      setList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler Bab Kategori
  const openModalBab = (bab = null) => {
    setErrorText('');
    if (bab) {
      setBabFormData({ id: bab.id, judul: bab.judul, urutan: bab.urutan || 1 });
    } else {
      setBabFormData({ id: null, judul: '', urutan: list.length + 1 });
    }
    setModalBabOpen(true);
  };

  const handleSaveBab = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');

    const res = await simpanPanduanBab(babFormData);
    if (res.success) {
      setModalBabOpen(false);
      loadData();
    } else {
      setErrorText(res.error || 'Gagal menyimpan kategori bab panduan.');
    }
    setSubmitting(false);
  };

  const handleDeleteBab = async (id) => {
    if (confirm('Hapus kategori bab ini? Semua sub-materi di dalamnya juga akan ikut terhapus.')) {
      const res = await hapusPanduanBab(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus bab panduan.');
      }
    }
  };

  // Handler Sub-Materi
  const openModalSub = (babId, sub = null) => {
    setErrorText('');
    if (sub) {
      setSubFormData({
        id: sub.id,
        judul_panduan_id: babId,
        sub_judul: sub.sub_judul || '',
        isi: sub.isi || '',
        link_vidio: sub.link_vidio || '',
        urutan: sub.urutan || 1,
      });
    } else {
      setSubFormData({
        id: null,
        judul_panduan_id: babId,
        sub_judul: '',
        isi: '',
        link_vidio: '',
        urutan: 1,
      });
    }
    setModalSubOpen(true);
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');

    const res = await simpanIsiPanduan(subFormData);
    if (res.success) {
      setModalSubOpen(false);
      loadData();
    } else {
      setErrorText(res.error || 'Gagal menyimpan materi sub-bab.');
    }
    setSubmitting(false);
  };

  const handleDeleteSub = async (id) => {
    if (confirm('Hapus materi panduan ini?')) {
      const res = await hapusIsiPanduan(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus sub-materi.');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Manajemen Panduan & Regulasi Pemilu
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Kelola hierarki bab kategori, materi tata tertib, dan cuplikan video YouTube/Drive.
          </p>
        </div>

        <button
          onClick={() => openModalBab()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bab Kategori Baru</span>
        </button>
      </div>

      {/* List Kategori & Sub-Materi */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3">
          <BookOpen className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Panduan</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Klik tombol di atas untuk membuat bab panduan pertama.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((bab) => (
            <div
              key={bab.id}
              className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-lg transition-all"
            >
              {/* Header Bab Kategori */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                    {bab.urutan}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{bab.judul}</h2>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      {(bab.items || []).length} materi sub-bab
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModalSub(bab.id)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sub-Materi</span>
                  </button>
                  <button
                    onClick={() => openModalBab(bab)}
                    className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                    title="Edit Bab"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBab(bab.id)}
                    className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                    title="Hapus Bab"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub-Items List */}
              <div className="p-5 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {(bab.items || []).length === 0 ? (
                  <p className="text-xs text-zinc-500 py-3 text-center">
                    Belum ada materi di bab ini. Klik tombol &quot;Tambah Sub-Materi&quot;.
                  </p>
                ) : (
                  (bab.items || []).map((sub) => (
                    <div
                      key={sub.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                            {sub.sub_judul}
                          </span>
                          {sub.link_vidio && (
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Video
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {sub.isi}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => openModalSub(bab.id, sub)}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition text-xs cursor-pointer"
                          title="Edit Sub-Materi"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSub(sub.id)}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition text-xs cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Kategori Bab */}
      {modalBabOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {babFormData.id ? 'Edit Bab Kategori' : 'Tambah Bab Kategori'}
              </h2>
              <button onClick={() => setModalBabOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorText && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200">
                {errorText}
              </div>
            )}

            <form onSubmit={handleSaveBab} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Judul Kategori Bab *</label>
                <input
                  type="text"
                  required
                  value={babFormData.judul}
                  onChange={(e) => setBabFormData({ ...babFormData, judul: e.target.value })}
                  placeholder="Contoh: Persyaratan dan Tata Tertib Pemilih"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Urutan Tampil</label>
                <input
                  type="number"
                  min="1"
                  value={babFormData.urutan}
                  onChange={(e) => setBabFormData({ ...babFormData, urutan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalBabOpen(false)}
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

      {/* Modal Sub-Isi Materi */}
      {modalSubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {subFormData.id ? 'Edit Sub-Materi Panduan' : 'Tambah Sub-Materi Panduan'}
              </h2>
              <button onClick={() => setModalSubOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorText && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200">
                {errorText}
              </div>
            )}

            <form onSubmit={handleSaveSub} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Sub-Judul Materi *</label>
                <input
                  type="text"
                  required
                  value={subFormData.sub_judul}
                  onChange={(e) => setSubFormData({ ...subFormData, sub_judul: e.target.value })}
                  placeholder="Contoh: Dokumen Wajib Dibawa ke TPS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Tautan Video YouTube / Drive (Opsional)</label>
                <input
                  type="url"
                  value={subFormData.link_vidio}
                  onChange={(e) => setSubFormData({ ...subFormData, link_vidio: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... atau link Drive"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Isi Konten Panduan (Format Markdown) *</label>
                <textarea
                  required
                  rows={6}
                  value={subFormData.isi}
                  onChange={(e) => setSubFormData({ ...subFormData, isi: e.target.value })}
                  placeholder="Tuliskan petunjuk lengkap di sini. Mendukung pemformatan markdown seperti list, tebal, miring, dll."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Urutan Tampil Sub-Materi</label>
                <input
                  type="number"
                  min="1"
                  value={subFormData.urutan}
                  onChange={(e) => setSubFormData({ ...subFormData, urutan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalSubOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold shadow-xs cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
