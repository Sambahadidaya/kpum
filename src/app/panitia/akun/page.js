'use client';

import { useState, useEffect } from 'react';
import {
  getPanitiaAdminList,
  buatAkunPanitia,
  hapusAkunPanitia,
} from '@/api/panitia/rolePanitia';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  Users,
  Clock,
} from 'lucide-react';
import { formatWaktuIndo } from '@/utils/dateUtils';

export default function PanitiaAkunPage() {
  const [adminList, setAdminList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    email: '',
    no_tlpn: '',
    password: '',
    role_id: '',
  });

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    const res = await getPanitiaAdminList();
    if (res.success) {
      setAdminList(res.data || []);
      setRoleList(res.roles || []);
      setCurrentSession(res.currentAdmin);
      if (res.roles?.length > 0 && !formData.role_id) {
        setFormData((prev) => ({ ...prev, role_id: res.roles[0].id }));
      }
    }
    if (!isSilent) setLoading(false);
    else setRefreshing(false);
  };

  useEffect(() => {
    loadData(false);

    // Polling live keaktifan admin setiap 4 detik saat halaman sedang dibuka
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');

    if (formData.password.length < 6) {
      setErrorText('Kata sandi minimal 6 karakter.');
      setSubmitting(false);
      return;
    }

    const res = await buatAkunPanitia(formData);
    if (res.success) {
      setModalOpen(false);
      setFormData({
        nama: '',
        nim: '',
        email: '',
        no_tlpn: '',
        password: '',
        role_id: roleList[0]?.id || '',
      });
      loadData(false);
    } else {
      setErrorText(res.error || 'Gagal mendaftarkan akun panitia baru.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (adminId, authId) => {
    if (confirm('Hapus akun panitia ini? Pengguna ini tidak akan bisa login lagi.')) {
      const res = await hapusAkunPanitia(adminId, authId);
      if (res.success) {
        loadData(false);
      } else {
        alert(res.error || 'Gagal menghapus akun panitia.');
      }
    }
  };

  const totalAdmins = adminList.length;
  const onlineCount = adminList.filter((a) => a.is_online).length;
  const offlineCount = Math.max(0, totalAdmins - onlineCount);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Manajemen Akun Panitia
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              SuperAdmin Khusus
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Daftarkan akun panitia KPU baru dengan autentikasi Supabase dan pantau status aktif/offline panitia secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => {
              setErrorText('');
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Panitia</span>
          </button>
        </div>
      </div>

      {/* Statistik Ringkas Status Online/Offline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Akun Terdaftar</span>
            <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{totalAdmins}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Sedang Aktif (Online)</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span>{onlineCount}</span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                Online
              </span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Tidak Aktif (Offline)</span>
            <p className="text-lg font-black text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <span>{offlineCount}</span>
              <span className="text-[10px] font-semibold text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                Offline
              </span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          </div>
        </div>
      </div>

      {/* Tabel Akun Panitia */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Nama Panitia</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Terakhir Login</th>
                  <th className="py-3.5 px-4 font-semibold">NIM</th>
                  <th className="py-3.5 px-4 font-semibold">Email</th>
                  <th className="py-3.5 px-4 font-semibold">No. Telepon / WA</th>
                  <th className="py-3.5 px-4 font-semibold">Hak Akses Role</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {adminList.map((admin) => {
                  const roleName = admin.roleadmin?.role || 'adminPanitia';
                  const isCurrent = currentSession?.adminId === admin.id;

                  return (
                    <tr key={admin.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-5 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold flex items-center justify-center text-xs border border-zinc-200 dark:border-zinc-700">
                          {admin.nama?.charAt(0) || 'A'}
                        </div>
                        <span>{admin.nama}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            Anda
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {admin.is_online ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-850 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {admin.update_at ? (
                          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="font-mono text-[11px]">
                              {formatWaktuIndo(admin.update_at)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs italic">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{admin.nim}</td>
                      <td className="py-3.5 px-4">{admin.email}</td>
                      <td className="py-3.5 px-4 font-mono">{admin.no_tlpn || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                          {roleName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDelete(admin.id, admin.auth_id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Akun Panitia */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Daftarkan Akun Panitia Baru</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorText && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-zinc-500" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama Panitia"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nomor Induk Mahasiswa (NIM) *</label>
                <input
                  type="text"
                  required
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="NIM untuk login"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Alamat Email Kampus / Pribadi *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="panitia@lp3i.ac.id"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">No. Telepon / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.no_tlpn}
                  onChange={(e) => setFormData({ ...formData, no_tlpn: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi Akun (Password) *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Pilih Role Hak Akses *</label>
                <select
                  required
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                >
                  {roleList.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role} ({role.role === 'superAdmin' ? 'Akses Penuh Semua Menu' : 'Kelola Konten Pemilu'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
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
                  {submitting ? 'Memproses...' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
