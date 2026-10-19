'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  getPanitiaPaslonList,
  simpanPaslon,
  hapusPaslon,
} from '@/api/panitia/paslon';
import {
  Vote,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  X,
  AlertCircle,
  Quote,
  Users,
} from 'lucide-react';

export default function PanitiaPaslonPage() {
  const [paslonList, setPaslonList] = useState([]);
  const [kandidatOptions, setKandidatOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ success: null, text: '' });

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    nomor_urut: 1,
    kandidat1_id: '',
    kandidat2_id: '',
    slogan: '',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaPaslonList();
    if (res.success) {
      setPaslonList(res.data || []);
      setKandidatOptions(res.kandidatOptions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (paslon = null) => {
    setStatusMsg({ success: null, text: '' });
    if (paslon) {
      setFormData({
        id: paslon.id,
        nomor_urut: paslon.nomor_urut || 1,
        kandidat1_id: paslon.kandidat1_id || '',
        kandidat2_id: paslon.kandidat2_id || '',
        slogan: paslon.slogan || '',
      });
    } else {
      // Default nomor urut = jumlah paslon + 1
      const nextNum = (paslonList.length > 0
        ? Math.max(...paslonList.map((p) => p.nomor_urut || 0)) + 1
        : 1);

      setFormData({
        id: null,
        nomor_urut: nextNum,
        kandidat1_id: kandidatOptions[0]?.id || '',
        kandidat2_id: kandidatOptions[1]?.id || '',
        slogan: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ success: null, text: '' });

    const res = await simpanPaslon(formData);
    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      setStatusMsg({ success: false, text: res.error || 'Gagal menyimpan pasangan calon.' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, nomorUrut) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Paslon Nomor Urut ${nomorUrut}?`)) {
      const res = await hapusPaslon(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus paslon.');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Manajemen Pasangan Calon (Paslon)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Atur nomor urut resmi dan duet pasangan Calon Presiden & Wakil Presiden Mahasiswa.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paslon Baru</span>
        </button>
      </div>

      {/* Paslon Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : paslonList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3">
          <Vote className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Paslon Terdaftar</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Daftarkan pasangan calon dengan memilih calon presiden dan wakil presiden dari data kandidat.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paslonList.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md transition-all"
            >
              <div>
                {/* Header Nomor Urut & Aksi */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex flex-col items-center justify-center font-black">
                      <span className="text-[10px] uppercase font-bold tracking-wider leading-none">NO</span>
                      <span className="text-xl leading-none">{p.nomor_urut}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                        Pasangan Calon {p.nomor_urut}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        ID: {p.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(p)}
                      className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                      title="Edit Paslon"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.nomor_urut)}
                      className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                      title="Hapus Paslon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Duet Foto & Nama Calon */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {/* Calon 1 (Presma) */}
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      {p.kandidat1?.fotodiri_kandidat ? (
                        <Image
                          src={p.kandidat1.fotodiri_kandidat}
                          alt={p.kandidat1.nama_kandidat}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <UserCheck className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-bold text-white">
                        Capresma
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {p.kandidat1?.nama_kandidat || 'Belum dipilih'}
                      </h4>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {p.kandidat1?.prodi_kandidat || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Calon 2 (Wapresma) */}
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      {p.kandidat2?.fotodiri_kandidat ? (
                        <Image
                          src={p.kandidat2.fotodiri_kandidat}
                          alt={p.kandidat2.nama_kandidat}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <UserCheck className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-bold text-white">
                        Cawapresma
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {p.kandidat2?.nama_kandidat || 'Tanpa Cawapresma'}
                      </h4>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {p.kandidat2?.prodi_kandidat || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Slogan */}
                {p.slogan && (
                  <div className="mt-4 p-3 rounded-xl bg-blue-50/50 dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <Quote className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="italic font-medium leading-relaxed">&ldquo;{p.slogan}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Paslon */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {formData.id ? 'Edit Pasangan Calon' : 'Tambah Pasangan Calon'}
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
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nomor Urut Resmi *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.nomor_urut}
                  onChange={(e) => setFormData({ ...formData, nomor_urut: e.target.value })}
                  placeholder="Contoh: 1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 font-mono focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Calon Presiden Mahasiswa (Kandidat 1) *
                </label>
                <select
                  required
                  value={formData.kandidat1_id}
                  onChange={(e) => setFormData({ ...formData, kandidat1_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                >
                  <option value="">-- Pilih Calon Presiden Mahasiswa --</option>
                  {kandidatOptions.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kandidat} ({k.nim_kandidat} - {k.prodi_kandidat})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Calon Wakil Presiden Mahasiswa (Kandidat 2, Opsional)
                </label>
                <select
                  value={formData.kandidat2_id}
                  onChange={(e) => setFormData({ ...formData, kandidat2_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                >
                  <option value="">-- Tanpa Calon Wakil Presiden (Opsional) --</option>
                  {kandidatOptions.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kandidat} ({k.nim_kandidat} - {k.prodi_kandidat})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Slogan / Tagline Paslon</label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  placeholder="Contoh: Bergerak Bersama Membangun Harmoni Kampus"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
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
                  {submitting ? 'Menyimpan...' : 'Simpan Paslon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
