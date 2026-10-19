'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import { loginVotingMhs } from '@/api/publlic/voting';
import {
  Vote,
  CreditCard,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function VotingLoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nim: '',
    kode_voting: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [alreadyVotedWarning, setAlreadyVotedWarning] = useState(false);

  // Jika sudah ada session voting tersimpan, langsung redirect ke bilik suara
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('kpu_mhs_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed?.nim) {
          router.replace('/voting/voting');
        }
      }
    } catch (e) {
      // ignore
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorText('');
    setAlreadyVotedWarning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    setAlreadyVotedWarning(false);

    if (!formData.nim.trim() || !formData.kode_voting.trim()) {
      setErrorText('Harap isi NIM dan Kode Voting secara lengkap.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginVotingMhs({
        nim: formData.nim,
        kode_voting: formData.kode_voting,
      });

      if (!res.success) {
        setErrorText(res.error || 'Autentikasi gagal. Periksa kembali data Anda.');
        if (res.alreadyVoted) {
          setAlreadyVotedWarning(true);
        }
        setLoading(false);
        return;
      }

      // Simpan session mahasiswa di sessionStorage client-side
      sessionStorage.setItem('kpu_mhs_session', JSON.stringify(res.mhs));

      // Berpindah ke bilik suara
      router.push('/voting/voting');
    } catch (err) {
      setErrorText('Terjadi kendala saat menghubungi server. Silakan coba kembali.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <div className="max-w-4xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
            <Vote className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Autentikasi Hak Suara DPT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            Masuk Bilik Suara Elektronik
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Verifikasi identitas Anda dengan memasukkan NIM dan Kode Voting resmi yang Anda peroleh dari Panitia KPU Mahasiswa.
          </p>
        </div>

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Form Login */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
        <div className="bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4 text-center">
            <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
              Formulir Verifikasi Pemilih
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Setiap mahasiswa hanya dapat melakukan voting sebanyak 1 kali.
            </p>
          </div>

          {/* Pesan Error */}
          {errorText && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                alreadyVotedWarning
                  ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">{errorText}</span>
                {alreadyVotedWarning && (
                  <span className="text-[11px] opacity-90 block">
                    Jika Anda merasa belum pernah memilih namun status ini muncul, silakan hubungi Panitia KPU melalui menu Kontak.
                  </span>
                )}
              </div>
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
                  placeholder="Contoh: 21010045"
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
                />
              </div>
            </div>

            {/* Input Kode Voting */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kode Token Voting
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
                  placeholder="Masukkan 6-8 digit kode voting"
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 font-mono tracking-wider transition uppercase"
                />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Kode token voting bersifat rahasia dan hanya diberikan oleh panitia KPU.
              </p>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memvalidasi Data...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Bilik Suara</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Info footer */}
          <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Sistem E-Voting KPU Mahasiswa Politeknik LP3I
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
