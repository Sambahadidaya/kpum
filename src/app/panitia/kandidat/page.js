'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  getPanitiaKandidatList,
  simpanKandidat,
  hapusKandidat,
  toggleEliminasiKandidat,
} from '@/api/panitia/kandidat';
import { uploadFotoKandidat } from '@/api/storage';
import ImageCropperModal from '@/components/panitia/ImageCropperModal';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  GraduationCap,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  FileText,
  ChevronDown,
} from 'lucide-react';

export default function PanitiaKandidatPage() {
  const [kandidatList, setKandidatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ success: null, text: '' });
  const [updatingEliminatedId, setUpdatingEliminatedId] = useState(null);

  // State untuk Image Cropper Modal
  const [cropperModal, setCropperModal] = useState({
    isOpen: false,
    imageSrc: '',
    fileName: '',
    isPng: false,
    aspectRatio: 4 / 5,
    title: 'Verifikasi & Crop Foto Diri Kandidat',
    subtitle: 'Atur posisi dan perbesaran foto diri kandidat (rasio 4:5). File PNG transparan didukung penuh.',
  });

  // State Form
  const [formData, setFormData] = useState({
    id: null,
    nama_kandidat: '',
    nim_kandidat: '',
    prodi_kandidat: '',
    posisi: 'Calon Presiden Mahasiswa',
    fotodiri_kandidat: '',
    is_eliminated: false,
    detail_kandidat_id: null,
    notlpn_wa_kandidat: '',
    emailplb_kandidat: '',
    cv_portofolio_kandidat: '',
    visi: '',
    misi: '',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaKandidatList();
    if (res.success) {
      setKandidatList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (kandidat = null) => {
    setStatusMsg({ success: null, text: '' });
    if (kandidat) {
      setFormData({
        id: kandidat.id,
        nama_kandidat: kandidat.nama_kandidat || '',
        nim_kandidat: kandidat.nim_kandidat || '',
        prodi_kandidat: kandidat.prodi_kandidat || '',
        posisi: kandidat.posisi || 'Calon Presiden Mahasiswa',
        fotodiri_kandidat: kandidat.fotodiri_kandidat || '',
        is_eliminated: Boolean(kandidat.is_eliminated),
        detail_kandidat_id: kandidat.detail_kandidat_id || null,
        notlpn_wa_kandidat: kandidat.detail_kandidat?.notlpn_wa_kandidat || '',
        emailplb_kandidat: kandidat.detail_kandidat?.emailplb_kandidat || '',
        cv_portofolio_kandidat: kandidat.detail_kandidat?.cv_portofolio_kandidat || '',
        visi: kandidat.detail_kandidat?.visi || '',
        misi: kandidat.detail_kandidat?.misi || '',
      });
    } else {
      setFormData({
        id: null,
        nama_kandidat: '',
        nim_kandidat: '',
        prodi_kandidat: '',
        posisi: 'Calon Presiden Mahasiswa',
        fotodiri_kandidat: '',
        is_eliminated: false,
        detail_kandidat_id: null,
        notlpn_wa_kandidat: '',
        emailplb_kandidat: '',
        cv_portofolio_kandidat: '',
        visi: '',
        misi: '',
      });
    }
    setModalOpen(true);
  };

  // Handler saat admin memilih file gambar foto kandidat (buka cropper modal dulu)
  const handleSelectImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const objectUrl = URL.createObjectURL(file);

    setCropperModal({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: file.name,
      isPng,
      aspectRatio: 4 / 5,
      title: 'Verifikasi & Crop Foto Diri Kandidat',
      subtitle: 'Atur posisi dan perbesaran foto diri kandidat (rasio 4:5). File PNG transparan didukung penuh.',
    });

    // Reset input file agar dapat memilih file yang sama jika diinginkan
    e.target.value = '';
  };

  // Handler setelah konfirmasi crop di modal
  const handleCropComplete = async (croppedFile) => {
    setCropperModal((prev) => ({ ...prev, isOpen: false }));
    setUploadingPhoto(true);

    const body = new FormData();
    body.append('file', croppedFile);

    const res = await uploadFotoKandidat(body);
    if (res.success && res.url) {
      setFormData((prev) => ({ ...prev, fotodiri_kandidat: res.url }));
    } else {
      alert(res.error || 'Gagal mengompres dan mengunggah gambar kandidat.');
    }
    setUploadingPhoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ success: null, text: '' });

    const res = await simpanKandidat(formData);
    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      setStatusMsg({ success: false, text: res.error || 'Gagal menyimpan data kandidat.' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, fotoUrl) => {
    if (confirm('Apakah Anda yakin ingin menghapus kandidat ini? Data yang dihapus tidak dapat dipulihkan.')) {
      const res = await hapusKandidat(id, fotoUrl);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus kandidat.');
      }
    }
  };

  const handleToggleEliminasi = async (id, currentValue) => {
    const nextValue = !currentValue;
    const confirmText = nextValue
      ? 'Apakah Anda yakin ingin MENYATAKAN ELIMINASI terhadap kandidat ini?'
      : 'Kembalikan status kandidat ini menjadi LOLOS SELEKSI / AKTIF?';

    if (!confirm(confirmText)) return;

    setUpdatingEliminatedId(id);
    const res = await toggleEliminasiKandidat(id, nextValue);
    if (res.success) {
      setKandidatList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_eliminated: nextValue } : item))
      );
    } else {
      alert(res.error || 'Gagal memperbarui status eliminasi kandidat.');
    }
    setUpdatingEliminatedId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Manajemen Kandidat Mahasiswa
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Kelola data calon presiden dan wakil presiden mahasiswa serta status verifikasi eliminasi.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kandidat Baru</span>
        </button>
      </div>

      {/* Kandidat Table / Card List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : kandidatList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3">
          <Users className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Kandidat</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Klik tombol Tambah Kandidat untuk mendaftarkan calon baru ke sistem portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kandidatList.map((k) => (
            <div
              key={k.id}
              className={`rounded-3xl bg-white dark:bg-zinc-950 border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg ${
                k.is_eliminated
                  ? 'border-red-300 dark:border-red-900/60 opacity-90'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {/* Foto Profile */}
              <div className="relative w-full aspect-4/3 bg-zinc-100 dark:bg-zinc-900">
                {k.fotodiri_kandidat ? (
                  <Image
                    src={k.fotodiri_kandidat}
                    alt={k.nama_kandidat}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                    <UserCheck className="w-12 h-12" />
                  </div>
                )}

                {/* Badge Posisi */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md text-[10px] font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                    {k.posisi}
                  </span>
                </div>

                {/* Status Eliminasi Badge */}
                <div className="absolute top-3 right-3">
                  {k.is_eliminated ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>Tereliminasi</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Lolos Seleksi</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Info Detail */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{k.nama_kandidat}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">NIM: {k.nim_kandidat}</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mt-2">
                    <GraduationCap className="w-4 h-4 text-zinc-500" />
                    <span>{k.prodi_kandidat}</span>
                  </p>
                </div>

                {/* Dropdown Verifikasi Status Seleksi / Eliminasi */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                      Status Verifikasi:
                    </span>
                    <select
                      value={k.is_eliminated ? 'eliminated' : 'active'}
                      disabled={updatingEliminatedId === k.id}
                      onChange={() => handleToggleEliminasi(k.id, k.is_eliminated)}
                      className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border transition cursor-pointer ${
                        k.is_eliminated
                          ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                      }`}
                    >
                      <option value="active">Lolos Seleksi (Aktif)</option>
                      <option value="eliminated">Dieliminasi (Tidak Lolos)</option>
                    </select>
                  </div>

                  {/* Tombol Aksi Edit & Hapus */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => openModal(k)}
                      className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(k.id, k.fotodiri_kandidat)}
                      className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                      title="Hapus Kandidat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Kandidat (Scrollable Popup) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 max-h-[90vh] flex flex-col shadow-2xl transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formData.id ? 'Edit Data Kandidat' : 'Tambah Kandidat Baru'}
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Isi data lengkap kandidat beserta visi, misi, dan berkas portofolio.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg.text && (
              <div className="p-3 my-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 sm:pr-2 py-4 space-y-4 text-xs">
              {/* Upload Foto Diri */}
              <div className="space-y-2">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Foto Diri Kandidat (Otomatis Dikompres)
                </label>
                <div className="flex items-center gap-4">
                  {formData.fotodiri_kandidat ? (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shrink-0">
                      <Image
                        src={formData.fotodiri_kandidat}
                        alt="Preview Foto"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleSelectImageFile}
                      disabled={uploadingPhoto}
                      className="text-xs text-zinc-600 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-950 cursor-pointer"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {uploadingPhoto ? 'Sedang mengompres gambar...' : 'Format didukung: JPG, PNG, WEBP. Maks 10MB.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama_kandidat}
                    onChange={(e) => setFormData({ ...formData, nama_kandidat: e.target.value })}
                    placeholder="Nama Lengkap Kandidat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nomor Induk Mahasiswa (NIM) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nim_kandidat}
                    onChange={(e) => setFormData({ ...formData, nim_kandidat: e.target.value })}
                    placeholder="Contoh: 2102001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 font-mono focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Program Studi *</label>
                  <input
                    type="text"
                    required
                    value={formData.prodi_kandidat}
                    onChange={(e) => setFormData({ ...formData, prodi_kandidat: e.target.value })}
                    placeholder="Contoh: Manajemen Informatika"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Posisi Pencalonan</label>
                  <select
                    value={formData.posisi}
                    onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                  >
                    <option value="Calon Presiden Mahasiswa">Calon Presiden Mahasiswa</option>
                    <option value="Calon Wakil Presiden Mahasiswa">Calon Wakil Presiden Mahasiswa</option>
                  </select>
                </div>
              </div>

              {/* Status Seleksi di Form */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Status Seleksi Awal</label>
                <select
                  value={formData.is_eliminated ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_eliminated: e.target.value === 'true' })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                >
                  <option value="false">Lolos Seleksi (Aktif / Belum Tereliminasi)</option>
                  <option value="true">Dieliminasi (Tidak Lolos)</option>
                </select>
              </div>

              {/* Kontak & Portofolio */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">Kontak & Portofolio Kandidat</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Nomor Telepon / WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      value={formData.notlpn_wa_kandidat}
                      onChange={(e) => setFormData({ ...formData, notlpn_wa_kandidat: e.target.value })}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 font-mono focus:outline-hidden focus:border-zinc-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Email Mahasiswa</span>
                    </label>
                    <input
                      type="email"
                      value={formData.emailplb_kandidat}
                      onChange={(e) => setFormData({ ...formData, emailplb_kandidat: e.target.value })}
                      placeholder="kandidat@lp3i.ac.id"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Link CV / Portofolio (Google Drive / Website)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.cv_portofolio_kandidat}
                    onChange={(e) => setFormData({ ...formData, cv_portofolio_kandidat: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Detail Visi & Misi */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Visi Calon</label>
                <textarea
                  rows={3}
                  value={formData.visi}
                  onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
                  placeholder="Visi kepemimpinan calon..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Misi Calon</label>
                <textarea
                  rows={4}
                  value={formData.misi}
                  onChange={(e) => setFormData({ ...formData, misi: e.target.value })}
                  placeholder="Misi atau poin-poin gagasan terstruktur..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 resize-none"
                />
              </div>

              {/* Sticky Footer Action */}
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
                  disabled={submitting || uploadingPhoto}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 disabled:opacity-50 font-bold transition shadow-xs cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kandidat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperModal.isOpen}
        imageSrc={cropperModal.imageSrc}
        fileName={cropperModal.fileName}
        isPng={cropperModal.isPng}
        aspectRatio={cropperModal.aspectRatio}
        title={cropperModal.title}
        subtitle={cropperModal.subtitle}
        onConfirm={handleCropComplete}
        onClose={() => setCropperModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
