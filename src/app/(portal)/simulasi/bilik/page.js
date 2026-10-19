'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import PaslonSlider from '@/components/public/PaslonSlider';
import { getPublikPaslonList } from '@/api/publlic/paslon';
import {
  Vote,
  User,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  FlaskConical,
  ChevronRight,
  LogOut,
  Info,
  RotateCcw,
} from 'lucide-react';

export default function BilikSimulasiPage() {
  const router = useRouter();

  const [simSession, setSimSession] = useState(null);
  const [paslonList, setPaslonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaslon, setSelectedPaslon] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  // 1. Cek session simulasi (dari sessionStorage dengan flag isSimulasi)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('kpu_simulasi_session');
      if (!stored) {
        router.replace('/simulasi/login');
        return;
      }

      const parsed = JSON.parse(stored);
      if (!parsed?.isSimulasi) {
        sessionStorage.removeItem('kpu_simulasi_session');
        router.replace('/simulasi/login');
        return;
      }

      setSimSession(parsed);
    } catch (e) {
      router.replace('/simulasi/login');
    }
  }, [router]);

  // 2. Ambil daftar paslon resmi (read-only, tidak ada interaksi DB)
  useEffect(() => {
    async function loadPaslon() {
      setLoading(true);
      const res = await getPublikPaslonList();
      if (res.success) {
        setPaslonList(res.data || []);
      }
      setLoading(false);
    }
    loadPaslon();
  }, []);

  const handleOpenConfirm = (paslon) => {
    setSelectedPaslon(paslon);
    setConfirmModalOpen(true);
  };

  const handleKeluarBilik = () => {
    if (confirm('Apakah Anda ingin keluar dari bilik simulasi?')) {
      sessionStorage.removeItem('kpu_simulasi_session');
      router.push('/simulasi');
    }
  };

  const handleUlangiSimulasi = () => {
    sessionStorage.removeItem('kpu_simulasi_session');
    router.push('/simulasi/login');
  };

  // Konfirmasi pilihan simulasi — TIDAK ada submit ke database sama sekali
  const handleConfirmSimulasi = () => {
    if (!selectedPaslon || !simSession) return;

    // Hanya update UI, tidak ada API call apapun
    setSuccessInfo({
      nomorUrut: selectedPaslon.nomor_urut,
      slogan: selectedPaslon.slogan,
      capres: selectedPaslon.kandidat1?.nama_kandidat,
      cawapres: selectedPaslon.kandidat2?.nama_kandidat,
      namaMhs: simSession.nama_mhs,
      nim: simSession.nim,
    });

    // Hapus session simulasi (habis pakai, seperti aslinya)
    sessionStorage.removeItem('kpu_simulasi_session');
    setConfirmModalOpen(false);
    setVoteSuccess(true);
  };

  // Tampilan jika sudah selesai simulasi
  if (voteSuccess && successInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
        <div className="relative pt-12 sm:pt-20 pb-0 bg-amber-50/70 dark:bg-[#120f00]">
          <div className="max-w-xl mx-auto text-center space-y-3 px-4 sm:px-6 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <FlaskConical className="w-4 h-4" />
              <span>Simulasi Selesai</span>
            </div>

            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-amber-950 dark:text-zinc-100 tracking-tight">
              Simulasi Berhasil!
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Ini adalah hasil simulasi. Pilihan Anda <span className="font-bold text-amber-700 dark:text-amber-400">tidak disimpan</span> dan tidak memengaruhi hasil pemilihan resmi.
            </p>
          </div>

          <div className="w-full -mb-px leading-none">
            <BgWaveDivider className="w-full text-white dark:text-black" />
          </div>
        </div>

        <div className="flex-1 py-8 sm:py-12 px-4 max-w-md mx-auto w-full space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Status: Simulasi Selesai</span>
            </div>

            <div className="py-3 border-y border-zinc-100 dark:border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Pilihan dalam Simulasi</p>
              <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Pasangan Calon No. {successInfo.nomorUrut}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {successInfo.capres} {successInfo.cawapres ? `& ${successInfo.cawapres}` : ''}
              </p>
              {successInfo.slogan && (
                <p className="text-[10px] italic text-zinc-400 dark:text-zinc-500">
                  &ldquo;{successInfo.slogan}&rdquo;
                </p>
              )}
            </div>

            {/* Notice: tidak tersimpan */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-left flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                Data simulasi ini <strong>tidak tersimpan</strong> ke database maupun penyimpanan lokal. Untuk voting resmi, gunakan menu E-Voting.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={handleUlangiSimulasi}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Simulasi</span>
              </button>
              <Link
                href="/voting"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95"
              >
                <Vote className="w-4 h-4" />
                <span>Ke E-Voting Resmi</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              >
                <span>Kembali ke Beranda</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Bilik Simulasi */}
      <div className="relative pt-8 sm:pt-14 pb-0 bg-amber-50/60 dark:bg-[#120f00]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-4">
          {/* Banner Simulasi Mode */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-800/50">
            <FlaskConical className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              <span className="font-black">Mode Simulasi Aktif</span> — Pilihan Anda tidak akan disimpan ke database maupun penyimpanan lokal.
            </p>
          </div>

          {/* Bar Info Pemilih */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {simSession?.nama_mhs || 'Peserta Simulasi'}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  NIM: {simSession?.nim || 'DEMO-001'} •{' '}
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">Mode Simulasi</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleKeluarBilik}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Simulasi</span>
            </button>
          </div>

          <div className="text-center space-y-2 pt-2">
            <h1 className="text-2xl sm:text-4xl font-black text-amber-950 dark:text-zinc-100 tracking-tight">
              Bilik Simulasi Pemilihan
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              Geser kartu paslon untuk membandingkan calon, perbesar untuk meninjau visi-misi, lalu coba pilih salah satu.
            </p>
          </div>
        </div>

        {/* BgWaveDivider */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Utama Slider */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="h-64 sm:h-72 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
        ) : (
          <PaslonSlider
            paslonList={paslonList}
            renderAction={(paslon) => (
              <button
                type="button"
                onClick={() => handleOpenConfirm(paslon)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Pilih Simulasi No. {paslon.nomor_urut}</span>
              </button>
            )}
            emptyTitle="Belum Ada Pasangan Calon Resmi"
            emptyDesc="Panitia KPU belum menetapkan daftar pasangan calon untuk pemilu saat ini."
          />
        )}
      </div>

      {/* Modal Konfirmasi Simulasi */}
      {confirmModalOpen && selectedPaslon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Konfirmasi Pilihan Simulasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white dark:bg-amber-600 font-black text-xl mx-auto flex items-center justify-center shadow-xs">
                {selectedPaslon.nomor_urut}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Pasangan Calon No. {selectedPaslon.nomor_urut}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  {selectedPaslon.kandidat1?.nama_kandidat}{' '}
                  {selectedPaslon.kandidat2 ? `& ${selectedPaslon.kandidat2?.nama_kandidat}` : ''}
                </p>
              </div>
            </div>

            {/* Disclaimer simulasi */}
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-amber-50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/40">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Ingat — Ini Mode Simulasi:</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Pilihan ini <strong>tidak disimpan</strong> ke database maupun penyimpanan lokal. 
                Tidak ada efek pada hasil pemilihan resmi.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSimulasi}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Ya, Lanjutkan Simulasi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
