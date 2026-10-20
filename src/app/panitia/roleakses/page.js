'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getPanitiaRoleAksesList,
  simpanRoleAkses,
  hapusRoleAkses,
} from '@/api/panitia/roleAkses';
import { AVAILABLE_PERMISSIONS } from '@/lib/adminRoleData';
import {
  KeyRound,
  Plus,
  Edit,
  Trash2,
  X,
  AlertCircle,
  ShieldCheck,
  Check,
  CheckCircle2,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

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
    jenis: 'Editor', // 'Editor' | 'Viewer'
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

  // Kelompokkan AVAILABLE_PERMISSIONS berdasarkan Category
  const groupedPermissions = useMemo(() => {
    const groups = {};
    AVAILABLE_PERMISSIONS.forEach((perm) => {
      const cat = perm.category || 'Lainnya';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(perm);
    });
    return groups;
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
        jenis: roleItem.jenis || 'Editor',
        selectedPermissions: perms,
      });
    } else {
      setFormData({
        id: null,
        role: '',
        jenis: 'Editor',
        selectedPermissions: [
          'dashboard',
          'trafik',
          'kandidat',
          'paslon',
          'mhs',
          'voting',
          'panitia',
          'trafik_sosmed',
          'sekretaris',
          'dokumentasi',
          'jadwal',
          'panduan',
          'contact',
        ],
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

  const selectAllPermissions = (operationalOnly = false) => {
    if (operationalOnly) {
      const ops = AVAILABLE_PERMISSIONS.filter((p) => !p.superAdminOnly).map((p) => p.id);
      setFormData((prev) => ({ ...prev, selectedPermissions: ops }));
    } else {
      const all = AVAILABLE_PERMISSIONS.map((p) => p.id);
      setFormData((prev) => ({ ...prev, selectedPermissions: all }));
    }
  };

  const clearAllPermissions = () => {
    setFormData((prev) => ({ ...prev, selectedPermissions: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');

    const payload = {
      id: formData.id,
      role: formData.role,
      jenis: formData.jenis || 'Editor',
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
            Konfigurasi modul dan hak akses (permissions) bagi tiap peran panitia di seluruh halaman portal sistem.
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
            const rawPerms = (r.roleakses || r.roleAkses || '')
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean);

            const isAll = rawPerms.includes('all') || r.role === 'superAdmin';

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
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                            {r.role}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              r.jenis === 'Viewer'
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
                                : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                            }`}
                          >
                            {r.jenis === 'Viewer' ? 'Viewer' : 'Editor'}
                          </span>
                        </div>
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        Izin Modul yang Diberikan:
                      </span>
                      {isAll && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                          Akses Penuh Semua Modul
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rawPerms.length === 0 ? (
                        <span className="text-xs text-zinc-400 italic">Tidak ada izin akses terdaftar.</span>
                      ) : (
                        rawPerms.map((p) => {
                          const item = AVAILABLE_PERMISSIONS.find((item) => item.id === p);
                          const label = item ? item.label : p === 'all' ? 'Semua Modul (All)' : p;

                          return (
                            <span
                              key={p}
                              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-800 dark:text-zinc-200"
                            >
                              {label}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>{isAll ? 'Akses Total (Super)' : `Total ${rawPerms.length} modul aktif`}</span>
                  <span className="font-mono text-[10px]">
                    Tersedia {AVAILABLE_PERMISSIONS.length} modul sistem
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Role */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-5 max-h-[92vh] flex flex-col shadow-2xl transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formData.id ? 'Edit Hak Akses Role' : 'Tambah Role Panitia Baru'}
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Tentukan izin halaman dan modul yang boleh diakses peran ini.
                </p>
              </div>
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
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Contoh: panitiaHumas / panitiaSekretariat"
                  disabled={formData.role === 'superAdmin'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              {/* Pilihan Tipe Role: Editor vs Viewer */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Tipe Akses Role *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, jenis: 'Editor' }))}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      formData.jenis === 'Editor'
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Editor (Penuh)</span>
                      {formData.jenis === 'Editor' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <p className={`text-[10px] mt-1 leading-snug ${formData.jenis === 'Editor' ? 'opacity-85' : 'text-zinc-500'}`}>
                      Dapat mengelola, menambah, mengedit, dan menghapus data pada modul yang diizinkan.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, jenis: 'Viewer' }))}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      formData.jenis === 'Viewer'
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Viewer (Hanya Lihat)</span>
                      {formData.jenis === 'Viewer' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <p className={`text-[10px] mt-1 leading-snug ${formData.jenis === 'Viewer' ? 'opacity-85' : 'text-zinc-500'}`}>
                      Hanya dapat melihat (view only) data pada modul yang diizinkan tanpa aksi edit/hapus.
                    </p>
                  </button>
                </div>
              </div>

              {/* Action Toolbar Pemilihan Modul */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                      Pilih Akses Modul & Fitur:
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono">
                      {formData.selectedPermissions.length} / {AVAILABLE_PERMISSIONS.length} dipilih
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectAllPermissions(true)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold transition cursor-pointer"
                    >
                      Pilih Operasional
                    </button>
                    <button
                      type="button"
                      onClick={() => selectAllPermissions(false)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold transition cursor-pointer"
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={clearAllPermissions}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold transition cursor-pointer"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                {/* Daftar Modul Dikelompokkan berdasarkan Kategori */}
                <div className="space-y-4 pt-1">
                  {Object.entries(groupedPermissions).map(([category, items]) => (
                    <div
                      key={category}
                      className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-800">
                        <span className="font-extrabold text-[11px] uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          {category}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {items.filter((i) => formData.selectedPermissions.includes(i.id)).length} dari {items.length} aktif
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.map((perm) => {
                          const checked = formData.selectedPermissions.includes(perm.id);

                          return (
                            <div
                              key={perm.id}
                              onClick={() => togglePermission(perm.id)}
                              className={`p-2.5 rounded-xl border flex items-start justify-between gap-2.5 cursor-pointer transition select-none ${
                                checked
                                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                                  : 'bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs truncate">
                                    {perm.label}
                                  </span>
                                  {perm.superAdminOnly && (
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                        checked
                                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900'
                                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                                      }`}
                                    >
                                      SuperAdmin
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-[10px] leading-tight line-clamp-2 ${
                                    checked
                                      ? 'text-zinc-300 dark:text-zinc-600'
                                      : 'text-zinc-500 dark:text-zinc-400'
                                  }`}
                                >
                                  {perm.desc}
                                </p>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${
                                  checked
                                    ? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white border-transparent'
                                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5 stroke-3" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Tombol Modal */}
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
