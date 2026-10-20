'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loginPanitia } from '@/api/panitia/login';
import { getFirstAccessibleRoute } from '@/lib/adminRoleData';
import logoKpu from '@/aseets/logo.png';
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Globe,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginPanitia(nim, password);
      if (res.success) {
        const targetRoute = getFirstAccessibleRoute(res.roleAkses, res.role);
        router.push(targetRoute);
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Login gagal. Periksa NIM dan password Anda.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat proses login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Container Login Card */}
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Kolom Kiri: Sambutan Khusus Desktop */}
        <div className="hidden lg:flex lg:col-span-6 bg-blue-50/50 dark:bg-zinc-900/60 p-10 flex-col justify-between border-r border-blue-100 dark:border-zinc-800 relative overflow-hidden">
          {/* Logo & Header Sambutan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src={logoKpu}
                  alt="Logo KPU LP3I"
                  width={48}
                  height={48}
                  priority
                  className="object-cover w-full h-full scale-105"
                />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-blue-950 dark:text-zinc-100">PANEL ADMINISTRASI</h2>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">Pemilu Raya BEM LP3I</p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                Selamat Datang, <br />
                <span className="text-zinc-600 dark:text-zinc-400">Panitia Pemilu Raya.</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Silakan masuk dengan Nomor Induk Mahasiswa (NIM) dan kata sandi Anda untuk mengakses manajemen data pemilu, kandidat, dokumentasi, dan statistik pengunjung.
              </p>
            </div>
          </div>

          {/* Fitur Panel Panitia */}
          <div className="space-y-3 py-6">
            <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Verifikasi & Kelola Calon Kandidat Mahasiswa</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Monitoring Trafik Pengunjung & Statistik Kota/ISP</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Pembaruan Materi Panduan & Arsip Dokumentasi</span>
            </div>
          </div>

          {/* Footer Sambutan */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Komisi Pemilihan Umum Mahasiswa</span>
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition">
              <Globe className="w-3.5 h-3.5" />
              <span>Website Publik</span>
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="col-span-1 lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center my-auto">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header Form */}
            <div className="space-y-2 text-center lg:text-left">
              <div className="lg:hidden inline-flex w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 items-center justify-center text-zinc-900 dark:text-zinc-100 font-bold mb-2">
                KPU
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                Masuk Panel Panitia
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Gunakan akun panitia yang telah didaftarkan oleh SuperAdmin.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                <AlertCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Nomor Induk Mahasiswa (NIM)</span>
                </label>
                <input
                  type="text"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Masukkan NIM Anda"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 transition font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Kata Sandi / Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white disabled:opacity-50 text-xs font-bold shadow-sm shadow-blue-900/15 transition active:scale-98 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk ke Panel Panitia</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
              >
                &larr; Kembali ke Website Publik
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
