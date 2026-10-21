'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import PaslonSlider from '@/components/public/PaslonSlider';
import { getPublikPaslonList } from '@/api/publlic/paslon';
import { submitSuaraVoting, checkMhsVoted } from '@/api/publlic/voting';
import { getStatusJadwalVoting } from '@/api/publlic/jadwalVoting';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedData } from '@/hooks/useTranslatedData';
import TranslatingNotice from '@/components/public/TranslatingNotice';
import {
  Vote,
  User,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Info,
  Timer,
  Clock,
  Lock,
} from 'lucide-react';

export default function BilikVotingPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [mhsSession, setMhsSession] = useState(null);
  const { data: paslonList, loading, translating } = useTranslatedData('paslon', getPublikPaslonList);
  const [selectedPaslon, setSelectedPaslon] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // State Validasi Jadwal Voting
  const [jadwalStatus, setJadwalStatus] = useState('berlangsung');
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [scheduleExpiredWarning, setScheduleExpiredWarning] = useState(false);

  // Format detik countdown
  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // 1. Cek session login pemilih & validasi jadwal voting aktif
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('kpu_mhs_session');
      if (!stored) {
        router.replace('/voting/login');
        return;
      }

      const parsed = JSON.parse(stored);
      if (!parsed?.id || !parsed?.nim) {
        sessionStorage.removeItem('kpu_mhs_session');
        router.replace('/voting/login');
        return;
      }

      setMhsSession(parsed);

      // A. Cek ke server apakah pemilih ini sebenarnya sudah pernah vote
      checkMhsVoted(parsed.id).then((res) => {
        if (res.voted) {
          sessionStorage.removeItem('kpu_mhs_session');
          alert(t('vt.voted_alert', 'Anda sudah pernah menggunakan hak suara. Anda akan dialihkan.'));
          router.replace('/voting/login');
        }
      });

      // B. Cek ke server apakah jadwal voting masih aktif / berlangsung
      const verifySchedule = async () => {
        try {
          const res = await getStatusJadwalVoting();
          if (!res.success || res.status !== 'berlangsung') {
            sessionStorage.removeItem('kpu_mhs_session');
            setScheduleExpiredWarning(true);
            setTimeout(() => {
              router.replace('/voting/login');
            }, 3000);
            return;
          }
          setJadwalStatus(res.status);
          setCountdownSeconds(res.sisaWaktuDetik || 0);
        } catch (e) {
          // Abaikan error jaringan sementara
        }
      };

      verifySchedule();

      // Polling sinkronisasi jadwal setiap 30 detik
      const scheduleInterval = setInterval(verifySchedule, 30000);

      // Ticker countdown 1 detik — hanya mendekremen, TIDAK memanggil async di dalam updater
      const tickInterval = setInterval(() => {
        setCountdownSeconds((prev) => (prev <= 0 ? 0 : prev - 1));
      }, 1000);

      return () => {
        clearInterval(scheduleInterval);
        clearInterval(tickInterval);
      };
    } catch (e) {
      router.replace('/voting/login');
    }
  }, [router]);


  const handleOpenConfirm = (paslon) => {
    setSelectedPaslon(paslon);
    setErrorMsg('');
    setConfirmModalOpen(true);
  };

  const handleKeluarBilik = () => {
    if (confirm(t('vt.exit_confirm', 'Apakah Anda ingin membatalkan dan keluar dari bilik suara?'))) {
      sessionStorage.removeItem('kpu_mhs_session');
      router.push('/voting/login');
    }
  };

  const handleConfirmVote = async () => {
    if (!selectedPaslon || !mhsSession) return;

    setVotingInProgress(true);
    setErrorMsg('');

    try {
      const res = await submitSuaraVoting({
        mhsId: mhsSession.id,
        paslonId: selectedPaslon.id,
      });

      if (!res.success) {
        if (res.votingNotActive) {
          sessionStorage.removeItem('kpu_mhs_session');
          setConfirmModalOpen(false);
          setScheduleExpiredWarning(true);
          setVotingInProgress(false);
          return;
        }
        setErrorMsg(res.error || t('vt.err_save', 'Gagal menyimpan suara.'));
        setVotingInProgress(false);
        return;
      }

      // Berhasil vote! Hapus session agar tidak bisa vote lagi
      sessionStorage.removeItem('kpu_mhs_session');
      setVoteSuccess(true);
      setSuccessInfo({
        nomorUrut: selectedPaslon.nomor_urut,
        slogan: selectedPaslon.slogan,
        capres: selectedPaslon.kandidat1?.nama_kandidat,
        cawapres: selectedPaslon.kandidat2?.nama_kandidat,
        namaMhs: mhsSession.nama_mhs,
        nim: mhsSession.nim,
      });
      setConfirmModalOpen(false);
    } catch (err) {
      setErrorMsg(t('vt.err_record', 'Terjadi kendala saat merekam suara ke server.'));
    } finally {
      setVotingInProgress(false);
    }
  };

  // Tampilan jika sudah sukses memberikan suara
  if (voteSuccess && successInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
        <div className="relative pt-12 sm:pt-20 pb-0 bg-zinc-100/70 dark:bg-[#071710]">
          <div className="max-w-xl mx-auto text-center space-y-3 px-4 sm:px-6 pb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight">
              {t('vt.done_title', 'Hak Suara Berhasil Digunakan!')}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              {t('vt.done_thanks', 'Terima kasih')} <span className="font-bold text-zinc-900 dark:text-zinc-100">{successInfo.namaMhs}</span> ({t('ui.nim', 'NIM')}: {successInfo.nim}). {t('vt.done_thanks_post', 'Pilihan suara Anda telah dicatat secara sah dan rahasia oleh sistem KPU Mahasiswa.')}
            </p>
          </div>

          <div className="w-full -mb-px leading-none">
            <BgWaveDivider className="w-full text-white dark:text-black" />
          </div>
        </div>

        <div className="flex-1 py-8 sm:py-12 px-4 max-w-md mx-auto w-full space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('vt.done_status', 'Status: Selesai Memilih')}</span>
            </div>

            <div className="py-3 border-y border-zinc-100 dark:border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('vt.done_chosen', 'Pilihan Terpilih')}</p>
              <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {t('ui.paslon_card_title', 'Pasangan Calon No. {n}', { n: successInfo.nomorUrut })}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {successInfo.capres} {successInfo.cawapres ? `& ${successInfo.cawapres}` : ''}
              </p>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t('vt.done_rule', 'Sesuai ketentuan KPU Mahasiswa, setiap mahasiswa hanya dapat memilih 1 kali dan akun Anda telah keluar secara otomatis dari bilik suara.')}
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95"
            >
              <span>{t('vt.back_home', 'Kembali ke Halaman Utama')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Bilik Suara */}
      <div className="relative pt-8 sm:pt-14 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-4">
          {/* Bar Info Pemilih & Timer Jadwal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {mhsSession?.nama_mhs || t('vt.student_default', 'Mahasiswa')}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {t('ui.nim', 'NIM')}: {mhsSession?.nim || '-'} • <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{t('vt.vote_active', 'Hak Suara Aktif')}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Badge Hitung Mundur Sisa Waktu Bilik Suara */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                <Timer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                <span>{t('vt.time_left_short', 'Sisa: {time}', { time: formatCountdown(countdownSeconds) })}</span>
              </div>

              <button
                onClick={handleKeluarBilik}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('vt.exit_booth', 'Keluar Bilik')}</span>
              </button>
            </div>
          </div>

          <div className="text-center space-y-2 pt-2">
            <h1 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
              {t('vt.booth_title', 'Bilik Suara Pemilihan Mahasiswa')}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              {t('vt.booth_desc', 'Geser kartu paslon untuk membandingkan calon, perbesar untuk meninjau visi-misi lengkap, lalu tentukan pilihan Anda.')}
            </p>
          </div>
        </div>

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Utama Slider Bilik Suara */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
        {loading && translating ? (
          <TranslatingNotice show fullHeight />
        ) : loading ? (
          <div className="h-64 sm:h-72 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
        ) : (
          <PaslonSlider
            paslonList={paslonList}
            renderAction={(paslon) => (
              <button
                type="button"
                onClick={() => handleOpenConfirm(paslon)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Vote className="w-4 h-4" />
                <span>{t('vt.pick_paslon', 'Pilih Paslon No. {n}', { n: paslon.nomor_urut })}</span>
              </button>
            )}
            emptyTitle={t('vt.booth_empty_title', 'Belum Ada Pasangan Calon Resmi')}
            emptyDesc={t('vt.booth_empty_desc', 'Panitia KPU belum menetapkan daftar pasangan calon untuk pemilu saat ini.')}
          />
        )}
      </div>

      {/* Modal Konfirmasi Pemilihan Paslon */}
      {confirmModalOpen && selectedPaslon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                  <Vote className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {t('vt.confirm_title', 'Konfirmasi Pilihan Suara')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={votingInProgress}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-black text-xl mx-auto flex items-center justify-center shadow-xs">
                {selectedPaslon.nomor_urut}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {t('ui.paslon_card_title', 'Pasangan Calon No. {n}', { n: selectedPaslon.nomor_urut })}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  {selectedPaslon.kandidat1?.nama_kandidat} {selectedPaslon.kandidat2 ? `& ${selectedPaslon.kandidat2?.nama_kandidat}` : ''}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-100/80 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t('vt.warn_title', 'Peringatan Penting:')}</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {t('vt.warn_a', 'Pilihan suara Anda bersifat')} <strong>{t('vt.warn_b', 'permanen dan tidak dapat diubah')}</strong> {t('vt.warn_c', 'setelah dikonfirmasi. Setiap mahasiswa hanya memiliki 1 kali kesempatan memilih.')}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={votingInProgress}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                {t('vt.cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                disabled={votingInProgress}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {votingInProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('vt.recording', 'Merekam Suara...')}</span>
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4" />
                    <span>{t('vt.yes_confirm', 'Ya, Konfirmasi Suara')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Peringatan: Waktu Voting Telah Selesai / Ditutup */}
      {scheduleExpiredWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {t('vt.ended_title', 'Waktu Pemungutan Suara Telah Berakhir')}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t('vt.ended_desc', 'Bilik suara resmi ditutup oleh Panitia KPU Mahasiswa. Anda akan dialihkan kembali ke halaman awal...')}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('kpu_mhs_session');
                  router.replace('/voting/login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                {t('vt.back_login', 'Kembali ke Halaman Login')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
