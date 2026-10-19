'use client';

import { useState, useEffect } from 'react';
import {
  getPanitiaRoleAksesList,
  simpanRoleAkses,
  hapusRoleAkses,
} from '@/api/panitia/roleAkses';
import {
  KeyRound,
  Plus,
  Edit,
  Trash2,
  X,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard Pemantauan' },
  { id: 'kandidat', label: 'Manajemen Kandidat & Paslon' },
  { id: 'panitia', label: 'Manajemen Struktur Panitia' },
  { id: 'dokumentasi', label: 'Dokumentasi & Jadwal' },
  { id: 'panduan', label: 'Panduan Pemilu' },
  { id: 'contact', label: 'Pesan Kontak Pengaduan' },
  { id: 'akun', label: 'Manajemen Akun & Role (SuperAdmin)' },
];

export default function PanitiaRoleAksesPage() {
  const [roleList, setRoleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    role: '',
    selectedPermissions: [],
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaRoleAksesList();
    if (res.success) {
      setRoleList(res.data || []);
      setIsUnauthorized(false);
    } else {
      if (res.error?.includes('superAdmin') || res.error?.includes('ditolak')) {
        setIsUnauthorized(true);
      }
      setErrorText(res.error || 'Gagal memuat data role.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (roleItem = null) => {
    setErrorText('');
    if (roleItem) {
      const perms = (roleItem.roleakses || roleItem.roleAkses || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      setFormData({
        id: roleItem.id,
        role: roleItem.role || '',
        selectedPermissions: perms,
      });
    } else {
      setFormData({
        id: null,
        role: '',
        selectedPermissions: ['dashboard', 'kandidat', 'panitia', 'dokumentasi', 'panduan', 'contact'],
      });
    }
    setModalOpen(true);
  };

  const togglePermission = (permId) => {
    setFormData((prev) => {
      const exists = prev.selectedPermissions.includes(permId);
      const updated = exists
        ? prev.selectedPermissions.filter((p) => p !== permId)
        : [...prev.selectedPermissions, permId];
      return { ...prev, selectedPermissions: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');

    const payload = {
      id: formData.id,
      role: formData.role,
      roleakses: formData.selectedPermissions.join(','),
    };

    const res = await simpanRoleAkses(payload);
    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      setErrorText(res.error || 'Gagal menyimpan role.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, roleName) => {
    if (roleName === 'superAdmin') {
      alert('Role superAdmin adalah role inti sistem dan tidak dapat dihapus.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus role "${roleName}"?`)) {
      const res = await hapusRoleAkses(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus role.');
      }
    }
  };

  if (isUnauthorized) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Akses Terbatas: Khusus SuperAdmin</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Halaman manajemen roleakses hanya dapat diakses dan diubah oleh akun dengan hak akses Super Administrator.
        </p>
        <Link
          href="/panitia/dashboard"
          className="inline-block px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Manajemen Role & Hak Akses
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px] font-bold">
              SuperAdmin
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Konfigurasi level hak akses (permissions) bagi tiap peran panitia di portal sistem.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Role Baru</span>
        </button>
      </div>

      {/* Role Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : roleList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3">
          <KeyRound className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Role</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roleList.map((r) => {
            const perms = (r.roleakses || r.roleAkses || '')
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean);

            return (
              <div
                key={r.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                          {r.role}
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          ID: {r.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(r)}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                        title="Edit Hak Akses"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {r.role !== 'superAdmin' && (
                        <button
                          onClick={() => handleDelete(r.id, r.role)}
                          className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                          title="Hapus Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List Hak Akses Badge */}
                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Izin Fitur yang Diberikan:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {perms.length === 0 ? (
                        <span className="text-xs text-zinc-400 italic">Tidak ada izin akses terdaftar.</span>
                      ) : (
                        perms.map((p) => (
                          <span
                            key={p}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-800 dark:text-zinc-200"
                          >
                            {AVAILABLE_PERMISSIONS.find((item) => item.id === p)?.label || p}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400">
                  Total {perms.length} modul aktif
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Role */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {formData.id ? 'Edit Hak Akses Role' : 'Tambah Role Baru'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorText && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nama Role *</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Contoh: panitiaHumas / bendahara"
                  disabled={formData.role === 'superAdmin'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Pilih Akses Menu & Fitur:
                </label>
                <div className="space-y-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const checked = formData.selectedPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          checked
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <span>{perm.label}</span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            checked
                              ? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white border-transparent'
                              : 'border-zinc-400 dark:border-zinc-600'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5 stroke-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                  {submitting ? 'Menyimpan...' : 'Simpan Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
