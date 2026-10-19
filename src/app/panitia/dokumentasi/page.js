'use client';

import { useState, useEffect } from 'react';
import {
  getPanitiaDokumentasiList,
  simpanDokumentasi,
  hapusDokumentasi,
} from '@/api/panitia/dokumentasi';
import { formatTanggalIndo } from '@/utils/dateUtils';
import { getGoogleDriveEmbedUrl } from '@/utils/driveUtils';
import {
  FolderKanban,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';

export default function PanitiaDokumentasiPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ success: null, text: '' });

  const [formData, setFormData] = useState({
    id: null,
    judul_dokumentasi: '',
    tanggal_dokumentasi: new Date().toISOString().split('T')[0],
    link_drive: '',
    deskripsi: '',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaDokumentasiList();
    if (res.success) {
      setList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (item = null) => {
    setStatusMsg({ success: null, text: '' });
    if (item) {
      setFormData({
        id: item.id,
        judul_dokumentasi: item.judul_dokumentasi || '',
        tanggal_dokumentasi: item.tanggal_dokumentasi || new Date().toISOString().split('T')[0],
        link_drive: item.link_drive || '',
        deskripsi: item.deskripsi || '',
      });
    } else {
      setFormData({
        id: null,
        judul_dokumentasi: '',
        tanggal_dokumentasi: new Date().toISOString().split('T')[0],
        link_drive: '',
        deskripsi: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ success: null, text: '' });

    const res = await simpanDokumentasi(formData);
    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      setStatusMsg({ success: false, text: res.error || 'Gagal menyimpan dokumentasi.' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus arsip dokumentasi ini?')) {
      const res = await hapusDokumentasi(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus dokumentasi.');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Manajemen Dokumentasi Pemilu
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Kelola arsip tautan Google Drive dan pratinjau cuplikan foto kegiatan KPU.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Dokumentasi Baru</span>
        </button>
      </div>

      {/* Grid Dokumentasi */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3">
          <FolderKanban className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Dokumentasi</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Klik tombol Tambah Dokumentasi untuk memasukkan tautan Google Drive baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatTanggalIndo(item.tanggal_dokumentasi)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {item.judul_dokumentasi}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3">
                  {item.deskripsi || 'Arsip Google Drive kegiatan pemilu.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Embed</span>
                  </button>

                  <a
                    href={item.link_drive}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition"
                    title="Buka Tab Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => openModal(item)}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                    title="Edit Data"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {formData.id ? 'Edit Dokumentasi' : 'Tambah Dokumentasi Baru'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg.text && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-zinc-500" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Judul Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={formData.judul_dokumentasi}
                  onChange={(e) => setFormData({ ...formData, judul_dokumentasi: e.target.value })}
                  placeholder="Contoh: Sosialisasi Pemilu di Aula Utama"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Tanggal Kegiatan</label>
                <input
                  type="date"
                  value={formData.tanggal_dokumentasi}
                  onChange={(e) => setFormData({ ...formData, tanggal_dokumentasi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Tautan Google Drive (Folder/File) *</label>
                <input
                  type="url"
                  required
                  value={formData.link_drive}
                  onChange={(e) => setFormData({ ...formData, link_drive: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                />
                <p className="text-[10px] text-zinc-500">
                  Pastikan akses link Google Drive diset ke &quot;Siapa saja yang memiliki link dapat melihat&quot;.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Keterangan agenda atau dokumentasi..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
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
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 disabled:opacity-50 font-bold shadow-xs cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Embed Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{previewItem.judul_dokumentasi}</span>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-zinc-100 dark:bg-black">
              <iframe
                src={getGoogleDriveEmbedUrl(previewItem.link_drive)}
                title={previewItem.judul_dokumentasi}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
