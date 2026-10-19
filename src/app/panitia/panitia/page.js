'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  getPanitiaList,
  simpanPanitia,
  hapusPanitia,
} from '@/api/panitia/panitia';
import { uploadFotoPanitia, uploadBgPanitia } from '@/api/storage';
import ImageCropperModal from '@/components/panitia/ImageCropperModal';
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Briefcase,
  X,
  AlertCircle,
  Search,
  ArrowUpDown,
  Upload,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';


export default function PanitiaAdminPage() {
  const [panitiaList, setPanitiaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingState, setUploadingState] = useState(null); // 'foto' | 'bg' | null
  const [statusMsg, setStatusMsg] = useState({ success: null, text: '' });

  // State untuk Image Cropper Modal
  const [cropperModal, setCropperModal] = useState({
    isOpen: false,
    imageSrc: '',
    fileName: '',
    isPng: false,
    targetField: 'foto_panitia', // 'foto_panitia' | 'bg_image'
    aspectRatio: 4 / 5,
    title: '',
    subtitle: '',
  });

  // State Form Panitia Lengkap
  const [formData, setFormData] = useState({
    id: null,
    nama_panitia: '',
    prodi_panitia: '',
    jabatan_panitia: '',
    sub_jabatan_panitia: '',
    urutan: 1,
    foto_panitia: '',
    bg_image: '',
    sosmed: {
      whatsapp: '',
      instagram: '',
      threads: '',
      tiktok: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaList();
    if (res.success) {
      setPanitiaList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (panitia = null) => {
    setStatusMsg({ success: null, text: '' });
    if (panitia) {
      // Ambil data sosmed relasi bila ada
      const sosmedItem = Array.isArray(panitia.sosmed_panitia) && panitia.sosmed_panitia.length > 0
        ? panitia.sosmed_panitia[0]
        : (panitia.sosmed_panitia || {});

      setFormData({
        id: panitia.id,
        nama_panitia: panitia.nama_panitia || '',
        prodi_panitia: panitia.prodi_panitia || '',
        jabatan_panitia: panitia.jabatan_panitia || '',
        sub_jabatan_panitia: panitia.sub_jabatan_panitia || '',
        urutan: panitia.urutan !== undefined && panitia.urutan !== null ? panitia.urutan : 1,
        foto_panitia: panitia.foto_panitia || '',
        bg_image: panitia.bg_image || '',
        sosmed: {
          whatsapp: sosmedItem.whatsapp || '',
          instagram: sosmedItem.instagram || '',
          threads: sosmedItem.threads || '',
          tiktok: sosmedItem.tiktok || '',
        },
      });
    } else {
      setFormData({
        id: null,
        nama_panitia: '',
        prodi_panitia: '',
        jabatan_panitia: '',
        sub_jabatan_panitia: '',
        urutan: (panitiaList.length || 0) + 1,
        foto_panitia: '',
        bg_image: '',
        sosmed: {
          whatsapp: '',
          instagram: '',
          threads: '',
          tiktok: '',
        },
      });
    }
    setModalOpen(true);
  };

  // Handler saat admin memilih file gambar foto atau background
  const handleSelectImageFile = (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const objectUrl = URL.createObjectURL(file);

    if (targetField === 'foto_panitia') {
      setCropperModal({
        isOpen: true,
        imageSrc: objectUrl,
        fileName: file.name,
        isPng,
        targetField: 'foto_panitia',
        aspectRatio: 4 / 5, // Rasio foto potret 4:5
        title: 'Verifikasi & Crop Foto Diri Panitia',
        subtitle: 'Atur posisi foto dengan rasio 4:5. File PNG transparan didukung penuh.',
      });
    } else {
      setCropperModal({
        isOpen: true,
        imageSrc: objectUrl,
        fileName: file.name,
        isPng,
        targetField: 'bg_image',
        aspectRatio: 16 / 9, // Rasio background kartu 16:9
        title: 'Verifikasi & Crop Background Kartu',
        subtitle: 'Atur posisi gambar background dengan rasio kartu 16:9 (opsional).',
      });
    }

    // Reset input file agar bisa memilih file yang sama jika diinginkan
    e.target.value = '';
  };

  // Handler setelah konfirmasi crop di modal
  const handleCropComplete = async (croppedFile) => {
    const target = cropperModal.targetField;
    setCropperModal((prev) => ({ ...prev, isOpen: false }));

    if (target === 'foto_panitia') {
      setUploadingState('foto');
      const body = new FormData();
      body.append('file', croppedFile);

      const res = await uploadFotoPanitia(body);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, foto_panitia: res.url }));
      } else {
        alert(res.error || 'Gagal mengompres dan mengunggah foto panitia.');
      }
      setUploadingState(null);
    } else if (target === 'bg_image') {
      setUploadingState('bg');
      const body = new FormData();
      body.append('file', croppedFile);

      const res = await uploadBgPanitia(body);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, bg_image: res.url }));
      } else {
        alert(res.error || 'Gagal mengompres dan mengunggah background panitia.');
      }
      setUploadingState(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ success: null, text: '' });

    const res = await simpanPanitia(formData);
    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      setStatusMsg({ success: false, text: res.error || 'Gagal menyimpan data panitia.' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (panitia) => {
    if (confirm(`Apakah Anda yakin ingin menghapus panitia "${panitia.nama_panitia}"? Data yang dihapus tidak dapat dipulihkan.`)) {
      const res = await hapusPanitia(panitia.id, panitia.foto_panitia, panitia.bg_image);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus panitia.');
      }
    }
  };

  const filteredList = panitiaList.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.nama_panitia || '').toLowerCase().includes(query) ||
      (item.jabatan_panitia || '').toLowerCase().includes(query) ||
      (item.sub_jabatan_panitia || '').toLowerCase().includes(query) ||
      (item.prodi_panitia || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Manajemen Anggota Panitia KPU</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola profil, jabatan, sub jabatan, sosial media, gambar background kartu, dan foto panitia dengan verifikasi crop.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anggota Panitia</span>
        </button>
      </div>

      {/* Baris Pencarian & Statistik Ringkas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, jabatan, sub jabatan, atau prodi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 self-start sm:self-auto font-mono">
          <span>Total:</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            {panitiaList.length} Anggota
          </span>
        </div>
      </div>

      {/* Grid Kartu Panitia (Desktop First) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3">
          <UserCheck className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {searchQuery ? 'Tidak Ada Hasil yang Cocok' : 'Belum Ada Anggota Panitia'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {searchQuery
              ? 'Silakan coba kata kunci lain untuk mencari panitia.'
              : 'Klik tombol Tambah Anggota Panitia untuk menambahkan data panitia baru.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const sosmedItem = Array.isArray(item.sosmed_panitia) && item.sosmed_panitia.length > 0
              ? item.sosmed_panitia[0]
              : (item.sosmed_panitia || {});

            return (
              <div
                key={item.id}
                className="relative rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg transition-all"
              >
                {/* Background Image Preview jika ada */}
                {item.bg_image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                    style={{ backgroundImage: `url(${item.bg_image})` }}
                  />
                )}

                {/* Foto Profil Panitia */}
                <div className="relative w-full aspect-4/3 bg-zinc-100 dark:bg-zinc-900 z-10">
                  {item.foto_panitia ? (
                    <Image
                      src={item.foto_panitia}
                      alt={item.nama_panitia}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain object-bottom p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                      <UserCheck className="w-12 h-12 opacity-40 mb-1" />
                      <span className="text-[10px] font-mono">Belum Ada Foto</span>
                    </div>
                  )}

                  {/* Badge Urutan & Jabatan */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[85%]">
                    <span className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-black/95 backdrop-blur-md text-[10px] font-bold text-blue-900 dark:text-blue-300 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                      #{item.urutan || 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-black/95 backdrop-blur-md text-[10px] font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs truncate">
                      {item.jabatan_panitia}
                    </span>
                  </div>

                  {item.bg_image && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/90 text-white text-[9px] font-semibold backdrop-blur-md border border-white/20">
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>BG Ada</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Detail Panitia */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between z-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xs">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{item.nama_panitia}</h3>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.jabatan_panitia}</span>
                      </p>
                      {item.sub_jabatan_panitia && (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {item.sub_jabatan_panitia}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 mt-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{item.prodi_panitia}</span>
                    </p>

                    {/* Indikator Sosmed */}
                    {(sosmedItem.whatsapp || sosmedItem.instagram || sosmedItem.tiktok || sosmedItem.threads) && (
                      <div className="flex items-center gap-2 mt-2.5 text-zinc-400 dark:text-zinc-500 text-xs">
                        <Share2 className="w-3 h-3 text-zinc-400" />
                        <span className="text-[10px] font-mono">
                          Sosmed:{' '}
                          {[
                            sosmedItem.whatsapp && 'WA',
                            sosmedItem.instagram && 'IG',
                            sosmedItem.tiktok && 'TikTok',
                            sosmedItem.threads && 'Threads',
                          ].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                      title="Edit Panitia"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                      title="Hapus Panitia"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Tambah / Edit Panitia */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {formData.id ? 'Edit Data Panitia' : 'Tambah Anggota Panitia Baru'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg.text && (
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 text-xs ${
                  statusMsg.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Panitia */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Lengkap Panitia <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Raihan"
                  value={formData.nama_panitia}
                  onChange={(e) => setFormData({ ...formData, nama_panitia: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Jabatan Panitia & Sub Jabatan Panitia (2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Jabatan Panitia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ketua KPU, Divisi Acara"
                    value={formData.jabatan_panitia}
                    onChange={(e) => setFormData({ ...formData, jabatan_panitia: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Sub Jabatan Panitia (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Koordinator Lapangan, Sie Logistik"
                    value={formData.sub_jabatan_panitia}
                    onChange={(e) => setFormData({ ...formData, sub_jabatan_panitia: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Program Studi & Urutan Tampil (2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Program Studi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Manajemen Informatika"
                    value={formData.prodi_panitia}
                    onChange={(e) => setFormData({ ...formData, prodi_panitia: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Urutan Tampilan</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Sosial Media Panitia (Opsional) */}
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Sosial Media Panitia (Opsional)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Ikon sosmed hanya akan muncul di bawah nama panitia jika tautan/nomor ini diisi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <i className="fa-brands fa-whatsapp text-emerald-600 text-xs" />
                      <span>WhatsApp (No HP / Link)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 081234567890"
                      value={formData.sosmed.whatsapp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sosmed: { ...formData.sosmed, whatsapp: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <i className="fa-brands fa-instagram text-pink-600 text-xs" />
                      <span>Instagram (@username / link)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: @nama_panitia"
                      value={formData.sosmed.instagram}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sosmed: { ...formData.sosmed, instagram: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <i className="fa-brands fa-tiktok text-zinc-700 dark:text-zinc-300 text-xs" />
                      <span>TikTok (@username / link)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: @nama_panitia"
                      value={formData.sosmed.tiktok}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sosmed: { ...formData.sosmed, tiktok: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Threads */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <i className="fa-brands fa-threads text-zinc-700 dark:text-zinc-300 text-xs" />
                      <span>Threads (@username / link)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: @nama_panitia"
                      value={formData.sosmed.threads}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sosmed: { ...formData.sosmed, threads: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Foto Panitia (Dengan Verifikasi Crop Rasio 4:5) */}
              <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Foto Panitia (Mendukung PNG Transparan, Rasio 4:5)</span>
                  </label>
                  {formData.foto_panitia && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, foto_panitia: '' })}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="relative w-20 h-24 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.foto_panitia ? (
                      <Image
                        src={formData.foto_panitia}
                        alt="Preview Foto"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <UserCheck className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => handleSelectImageFile(e, 'foto_panitia')}
                      disabled={uploadingState === 'foto'}
                      className="text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-200 file:text-zinc-800 dark:file:bg-zinc-800 dark:file:text-zinc-200 hover:file:bg-zinc-300 dark:hover:file:bg-zinc-700 cursor-pointer"
                    />
                    <p className="text-[11px] text-zinc-500">
                      {uploadingState === 'foto'
                        ? 'Sedang mengunggah...'
                        : 'Memilih file akan membuka pop-up crop 4:5. PNG transparan didukung.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Gambar Background Kartu (Opsional, Rasio 16:9, Transparansi ~60%) */}
              <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Gambar Background Kartu (Opsional, Transparansi ~60%)</span>
                  </label>
                  {formData.bg_image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bg_image: '' })}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Hapus Background
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="relative w-28 h-16 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.bg_image ? (
                      <Image
                        src={formData.bg_image}
                        alt="Preview Background"
                        fill
                        className="object-cover opacity-75"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => handleSelectImageFile(e, 'bg_image')}
                      disabled={uploadingState === 'bg'}
                      className="text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-200 file:text-zinc-800 dark:file:bg-zinc-800 dark:file:text-zinc-200 hover:file:bg-zinc-300 dark:hover:file:bg-zinc-700 cursor-pointer"
                    />
                    <p className="text-[11px] text-zinc-500">
                      {uploadingState === 'bg'
                        ? 'Sedang mengunggah background...'
                        : 'Memilih file akan membuka pop-up crop 16:9 untuk background kartu.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tombol Simpan */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingState !== null}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal Pop-up */}
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
