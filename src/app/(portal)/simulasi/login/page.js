'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import {
  FlaskConical,
  CreditCard,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Info,
} from 'lucide-react';

// Akun demo yang sudah disiapkan untuk simulasi
const DEMO_ACCOUNT = {
  nim: 'DEMO-001',
  kode_voting: 'SIMULASI',
  id: 'simulasi-demo-id-001',
  nama_mhs: 'Peserta Simulasi',
};

export default function SimulasiLoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nim: DEMO_ACCOUNT.nim,
    kode_voting: DEMO_ACCOUNT.kode_voting,
  });

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorText('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorText('');

    if (!formData.nim.trim() || !formData.kode_voting.trim()) {
      setErrorText('Harap isi NIM dan Kode Voting simulasi secara lengkap.');
      return;
    }

    setLoading(true);

    // Simulasi: tidak perlu validasi ke server
    // Langsung set session simulasi di memory (tidak ke localStorage/sessionStorage)
    // Kita encode info ke URL params agar bisa dibaca bilik simulasi
    setTimeout(() => {
      // Simpan sesi simulasi hanya di sessionStorage dengan flag simulasi
      const simSession = {
        id: DEMO_ACCOUNT.id,
        nim: formData.nim || DEMO_ACCOUNT.nim,
        nama_mhs: 'Peserta Simulasi',
        isSimulasi: true,
      };
      sessionStorage.setItem('kpu_simulasi_session', JSON.stringify(simSession));
      router.push('/simulasi/bilik');
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-amber-50/60 dark:bg-[#120f00]">
        <div className="max-w-4xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <FlaskConical className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Mode Simulasi — Masuk Demo</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-950 dark:text-zinc-100 tracking-tight">
            Login Simulasi Bilik Suara
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Akun demo sudah terisi otomatis di bawah. Klik tombol masuk untuk langsung mencoba pengalaman voting.
          </p>
        </div>

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Form Login */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
        {/* Disclaimer Banner */}
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            <span className="font-bold">Mode Simulasi Aktif.</span> Anda dapat mengubah isian di bawah, 
            namun akun ini tidak divalidasi ke database. Tidak ada data yang tersimpan.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-amber-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4 text-center">
            <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
              Formulir Login Simulasi
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Akun demo sudah disiapkan — tidak diperlukan data asli.
            </p>
          </div>

          {/* Pesan Error */}
          {errorText && (
            <div className="p-3.5 rounded-2xl text-xs flex items-start gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorText}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input NIM */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nomor Induk Mahasiswa (NIM)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleChange}
                  placeholder="Contoh: DEMO-001"
                  disabled={loading}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-amber-50/50 dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-700 transition"
                />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Untuk simulasi, gunakan NIM demo yang sudah terisi atau isi bebas.
              </p>
            </div>

            {/* Input Kode Voting */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kode Token Voting (Simulasi)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="kode_voting"
                  value={formData.kode_voting}
                  onChange={handleChange}
                  placeholder="SIMULASI"
                  disabled={loading}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-amber-50/50 dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-700 font-mono tracking-wider transition uppercase"
                />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Kode ini hanya untuk simulasi dan tidak divalidasi ke server.
              </p>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Memuat Bilik Simulasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Bilik Simulasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Info footer */}
          <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Simulasi E-Voting KPU Mahasiswa Politeknik LP3I
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
