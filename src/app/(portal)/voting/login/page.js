'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import { loginVotingMhs } from '@/api/publlic/voting';
import { getStatusJadwalVoting } from '@/api/publlic/jadwalVoting';
import {
  Vote,
  CreditCard,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  Lock,
  Timer,
  AlertCircle,
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

  // State Jadwal & Waktu Server
  const [jadwalStatus, setJadwalStatus] = useState(null); // 'belum_dimulai' | 'berlangsung' | 'selesai' | 'tidak_ada_jadwal'
  const [jadwalLoading, setJadwalLoading] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [jadwalMessage, setJadwalMessage] = useState('');

  // State Contextual Pop-up Notifikasi (Tepat di atas elemen yang diklik)
  const [activePopup, setActivePopup] = useState({
    target: null, // 'nim' | 'kode_voting' | 'submit'
    message: '',
  });
  const popupTimeoutRef = useRef(null);

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

  // Fungsi Fetch Status Jadwal dari Server (WIB)
  const syncJadwal = async () => {
    try {
      const res = await getStatusJadwalVoting();
      if (res.success) {
        setJadwalStatus(res.status);
        setCountdownSeconds(res.sisaWaktuDetik || 0);
        setJadwalMessage(res.message || '');
      } else {
        setJadwalStatus('error');
      }
    } catch (err) {
      setJadwalStatus('error');
    } finally {
      setJadwalLoading(false);
    }
  };

  // Lifecycle Sync Jadwal & Countdown
  // Hanya berjalan saat halaman dibuka, dan di-reset saat keluar halaman
  useEffect(() => {
    syncJadwal();

    // Polling sync server time setiap 30 detik (hanya saat halaman aktif)
    // JANGAN panggil syncJadwal() di dalam setState updater — itu side effect saat render!
    const syncInterval = setInterval(() => {
      syncJadwal();
    }, 30000);

    // Countdown lokal per 1 detik — hanya mendekremen, TIDAK memanggil fungsi async
    const tickInterval = setInterval(() => {
      setCountdownSeconds((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(tickInterval);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, []);

  const isVotingOpen = jadwalStatus === 'berlangsung';
  const isInputsDisabled = !jadwalLoading && !isVotingOpen;

  // Format detik menjadi format waktu HH:MM:SS atau D hari HH:MM:SS
  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00:00';
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (days > 0) {
      return `${days} hari ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Memicu notifikasi pop-up tepat di atas elemen yang diklik (Warna Netral)
  const triggerPopup = (target) => {
    if (!isInputsDisabled) return;

    let msg = 'Bilik suara belum dibuka oleh panitia.';
    if (jadwalStatus === 'belum_dimulai') {
      msg = 'Pemungutan suara belum dimulai. Silakan tunggu hitung mundur jadwal resmi.';
    } else if (jadwalStatus === 'selesai') {
      msg = 'Waktu pemungutan suara telah selesai. Bilik suara sudah ditutup.';
    } else if (jadwalStatus === 'tidak_ada_jadwal') {
      msg = 'Jadwal voting belum diatur oleh Panitia KPU.';
    }

    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);

    setActivePopup({
      target,
      message: msg,
    });

    // Otomatis hilang dalam 3.5 detik
    popupTimeoutRef.current = setTimeout(() => {
      setActivePopup({ target: null, message: '' });
    }, 3500);
  };

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

    if (!isVotingOpen) {
      triggerPopup('submit');
      return;
    }

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
        if (res.votingNotActive) {
          // Re-sync jika status di server sudah berubah
          syncJadwal();
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100/60 dark:bg-zinc-800/60 border border-blue-200/80 dark:border-blue-900/60 text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
            <Vote className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
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
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4 text-center">
            <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
              Formulir Verifikasi Pemilih
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Setiap User/Akun hanya dapat melakukan voting sebanyak 1 kali.
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
            {/* Input NIM dengan Pop-up Notifikasi Tepat di Atas Inputan */}
            <div className="relative space-y-1.5">
              {/* Notifikasi Pop-up Di Atas Input NIM */}
              {activePopup.target === 'nim' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-40 w-max max-w-[280px] sm:max-w-xs animate-in fade-in zoom-in-95 pointer-events-none">
                  <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-3.5 py-2 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 text-center text-xs font-semibold leading-snug">
                    <span>{activePopup.message}</span>
                  </div>
                  {/* Caret segitiga panah ke bawah */}
                  <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-zinc-900 dark:border-t-zinc-100 mx-auto" />
                </div>
              )}

              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nomor Induk Mahasiswa (NIM) / ID UNIK
              </label>

              <div className="relative">
                {/* Overlay Penangkap Klik Saat Input Disabled (Mengatasi browser memblokir klik pada disabled input) */}
                {isInputsDisabled && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      triggerPopup('nim');
                    }}
                    className="absolute inset-0 z-20 cursor-not-allowed bg-transparent"
                    title="Bilik suara ditutup"
                  />
                )}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleChange}
                  placeholder="Contoh: 200101001 / XXXXXXX"
                  disabled={loading || isInputsDisabled}
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition ${
                    isInputsDisabled
                      ? 'bg-zinc-100/90 dark:bg-zinc-900/90 border-zinc-300/60 dark:border-zinc-800 text-zinc-400/80 dark:text-zinc-600 placeholder:text-zinc-400/50 dark:placeholder:text-zinc-600/50 cursor-not-allowed select-none opacity-75'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
                  }`}
                />
              </div>
            </div>

            {/* Input Kode Voting dengan Pop-up Notifikasi Tepat di Atas Inputan */}
            <div className="relative space-y-1.5">
              {/* Notifikasi Pop-up Di Atas Input Kode */}
              {activePopup.target === 'kode_voting' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-40 w-max max-w-[280px] sm:max-w-xs animate-in fade-in zoom-in-95 pointer-events-none">
                  <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-3.5 py-2 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 text-center text-xs font-semibold leading-snug">
                    <span>{activePopup.message}</span>
                  </div>
                  {/* Caret segitiga panah ke bawah */}
                  <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-zinc-900 dark:border-t-zinc-100 mx-auto" />
                </div>
              )}

              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kode Token Voting
              </label>

              <div className="relative">
                {/* Overlay Penangkap Klik Saat Input Disabled */}
                {isInputsDisabled && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      triggerPopup('kode_voting');
                    }}
                    className="absolute inset-0 z-20 cursor-not-allowed bg-transparent"
                    title="Bilik suara ditutup"
                  />
                )}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="kode_voting"
                  value={formData.kode_voting}
                  onChange={handleChange}
                  placeholder="Masukkan kode voting"
                  disabled={loading || isInputsDisabled}
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-mono tracking-wider transition uppercase ${
                    isInputsDisabled
                      ? 'bg-zinc-100/90 dark:bg-zinc-900/90 border-zinc-300/60 dark:border-zinc-800 text-zinc-400/80 dark:text-zinc-600 placeholder:text-zinc-400/50 dark:placeholder:text-zinc-600/50 cursor-not-allowed select-none opacity-75'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
                  }`}
                />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Kode token voting bersifat rahasia dan hanya diberikan oleh panitia KPU.
              </p>
            </div>

            {/* Tombol Submit dengan Pop-up Notifikasi Tepat di Atas Tombol Masuk */}
            <div className="relative pt-2">
              {/* Notifikasi Pop-up Di Atas Tombol Masuk */}
              {activePopup.target === 'submit' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-40 w-max max-w-[280px] sm:max-w-xs animate-in fade-in zoom-in-95 pointer-events-none">
                  <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-3.5 py-2 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 text-center text-xs font-semibold leading-snug">
                    <span>{activePopup.message}</span>
                  </div>
                  {/* Caret segitiga panah ke bawah */}
                  <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-zinc-900 dark:border-t-zinc-100 mx-auto" />
                </div>
              )}

              <div className="relative w-full">
                {/* Overlay Penangkap Klik Saat Tombol Disabled */}
                {isInputsDisabled && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      triggerPopup('submit');
                    }}
                    className="absolute inset-0 z-20 cursor-not-allowed bg-transparent"
                    title="Bilik suara ditutup"
                  />
                )}
                <button
                  type="submit"
                  disabled={loading || isInputsDisabled}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold shadow-xs transition ${
                    isInputsDisabled
                      ? 'bg-zinc-200/70 text-zinc-400 dark:bg-zinc-900/70 dark:text-zinc-600 border border-zinc-300/60 dark:border-zinc-800 cursor-not-allowed select-none opacity-80'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 hover:shadow-md active:scale-95 cursor-pointer'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memvalidasi Data...</span>
                    </>
                  ) : isInputsDisabled ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Bilik Suara Ditutup</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Bilik Suara</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Countdown Timer Di Bawah Tombol Masuk */}
            <div className="pt-2 text-center">
              {jadwalLoading ? (
                <div className="inline-flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memeriksa jadwal resmi...</span>
                </div>
              ) : jadwalStatus === 'selesai' ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                  <span>Waktu Voting Telah Selesai</span>
                </div>
              ) : jadwalStatus === 'belum_dimulai' ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                    Bilik Suara Dibuka Dalam:
                  </span>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-black text-zinc-900 dark:text-zinc-100">
                    <Clock className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    <span>{formatCountdown(countdownSeconds)}</span>
                  </div>
                </div>
              ) : jadwalStatus === 'berlangsung' ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Bilik Suara Sedang Dibuka
                  </span>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-black text-zinc-900 dark:text-zinc-100">
                    <Timer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    <span>Sisa Waktu: {formatCountdown(countdownSeconds)}</span>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Jadwal pemungutan suara belum ditentukan.</span>
                </div>
              )}
            </div>
          </form>

          {/* Info footer */}
          <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Sistem E-Voting KPUM Politeknik LP3I Bandung
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
