'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import PaslonSlider from '@/components/public/PaslonSlider';
import defaultImg from '@/aseets/default.jpg';
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
import { useTranslation } from '@/hooks/useTranslation';

const DUMMY_PASLON_LIST = [
  {
    id: 'dummy-paslon-1',
    nomor_urut: 1,
    slogan: 'Inovasi Bersama, Wujudkan Mahasiswa Berdaya Saing',
    kandidat1: {
      id: 'dummy-k1-1',
      nama_kandidat: 'Ahmad Faiz Pratama',
      nim_kandidat: '202301001',
      prodi_kandidat: 'Manajemen Informatika',
      fotodiri_kandidat: defaultImg.src,
      posisi: 'Calon Presiden Mahasiswa',
      detail_kandidat: {
        visi: 'Mewujudkan BEM sebagai wadah kolaboratif, progresif, dan inklusif demi kemajuan mahasiswa.',
        misi: '1. Mengembangkan potensi kepemimpinan mahasiswa.\n2. Memperkuat sinergi ormawa kampus.\n3. Mengawal aspirasi mahasiswa secara transparan.',
      },
    },
    kandidat2: {
      id: 'dummy-k2-1',
      nama_kandidat: 'Siti Nurhaliza',
      nim_kandidat: '202301002',
      prodi_kandidat: 'Komputerisasi Akuntansi',
      fotodiri_kandidat: defaultImg.src,
      posisi: 'Calon Wakil Presiden Mahasiswa',
      detail_kandidat: {
        visi: 'Mewujudkan BEM sebagai wadah kolaboratif, progresif, dan inklusif demi kemajuan mahasiswa.',
        misi: '1. Mengembangkan potensi kepemimpinan mahasiswa.\n2. Memperkuat sinergi ormawa kampus.\n3. Mengawal aspirasi mahasiswa secara transparan.',
      },
    },
  },
  {
    id: 'dummy-paslon-2',
    nomor_urut: 2,
    slogan: 'Aksi Nyata untuk Kampus Berintegritas dan Berprestasi',
    kandidat1: {
      id: 'dummy-k1-2',
      nama_kandidat: 'Bima Satria Yudha',
      nim_kandidat: '202302003',
      prodi_kandidat: 'Teknik Komputer',
      fotodiri_kandidat: defaultImg.src,
      posisi: 'Calon Presiden Mahasiswa',
      detail_kandidat: {
        visi: 'Menciptakan kampus yang dinamis, berprestasi, dan berintegritas tinggi.',
        misi: '1. Menyelenggarakan program inkubasi karya mahasiswa.\n2. Optimalisasi advokasi hak-hak mahasiswa.\n3. Kolaborasi aktif dengan stakeholder eksternal.',
      },
    },
    kandidat2: {
      id: 'dummy-k2-2',
      nama_kandidat: 'Dewi Anggraini',
      nim_kandidat: '202302004',
      prodi_kandidat: 'Administrasi Bisnis',
      fotodiri_kandidat: defaultImg.src,
      posisi: 'Calon Wakil Presiden Mahasiswa',
      detail_kandidat: {
        visi: 'Menciptakan kampus yang dinamis, berprestasi, dan berintegritas tinggi.',
        misi: '1. Menyelenggarakan program inkubasi karya mahasiswa.\n2. Optimalisasi advokasi hak-hak mahasiswa.\n3. Kolaborasi aktif dengan stakeholder eksternal.',
      },
    },
  },
  {
    id: 'dummy-paslon-3',
    nomor_urut: 3,
    slogan: 'Sinergi Harmonis, Mengabdi untuk Seluruh Civitas Akademika',
    kandidat1: {
      id: 'dummy-k1-3',
      nama_kandidat: 'Chandra Wijaya',
      nim_kandidat: '202303005',
      prodi_kandidat: 'Manajemen Pemasaran',
      fotodiri_kandidat: defaultImg.src,
      posisi: 'Calon Presiden Mahasiswa',
      detail_kandidat: {
        visi: 'Menjadikan BEM sebagai pusat pelayanan aspirasi yang humanis dan solutif.',
        misi: '1. Meningkatkan keterlibatan aktif mahasiswa dalam kegiatan kampus.\n2. Digitalisasi layanan aspirasi dan informasi.\n3. Menumbuhkan semangat wirausaha muda.',
      },
    },
    kandidat2: {
      id: 'dummy-k2-3',
      nama_kandidat: 'Rina Kusuma Wardani',
      nim_kandidat: '202303006',
      prodi_kandidat: 'Hubungan Masyarakat',
      fotodiri_kandidat: defaultImg.src,
      posisi: 'Calon Wakil Presiden Mahasiswa',
      detail_kandidat: {
        visi: 'Menjadikan BEM sebagai pusat pelayanan aspirasi yang humanis dan solutif.',
        misi: '1. Meningkatkan keterlibatan aktif mahasiswa dalam kegiatan kampus.\n2. Digitalisasi layanan aspirasi dan informasi.\n3. Menumbuhkan semangat wirausaha muda.',
      },
    },
  },
];

export default function BilikSimulasiPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [simSession, setSimSession] = useState(null);
  const [paslonList] = useState(DUMMY_PASLON_LIST);
  const [loading] = useState(false);
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

  const handleOpenConfirm = (paslon) => {
    setSelectedPaslon(paslon);
    setConfirmModalOpen(true);
  };

  const handleKeluarBilik = () => {
    if (confirm(t('sm.exit_confirm', 'Apakah Anda ingin keluar dari bilik simulasi?'))) {
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
              <span>{t('sm.done_badge', 'Simulasi Selesai')}</span>
            </div>

            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-amber-950 dark:text-zinc-100 tracking-tight">
              {t('sm.done_title', 'Simulasi Berhasil!')}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              {t('sm.done_a', 'Ini adalah hasil simulasi. Pilihan Anda')}{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400">
                {t('sm.done_b', 'tidak disimpan')}
              </span>{' '}
              {t('sm.done_c', 'dan tidak memengaruhi hasil pemilihan resmi.')}
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
              <span>{t('sm.done_status', 'Status: Simulasi Selesai')}</span>
            </div>

            <div className="py-3 border-y border-zinc-100 dark:border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('sm.done_chosen', 'Pilihan dalam Simulasi')}</p>
              <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {t('ui.paslon_card_title', 'Pasangan Calon No. {n}', { n: successInfo.nomorUrut })}
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
                {t('sm.notice_a', 'Data simulasi ini')}{' '}
                <strong>{t('sm.notice_b', 'tidak tersimpan')}</strong>{' '}
                {t('sm.notice_c', 'ke database maupun penyimpanan lokal. Untuk voting resmi, gunakan menu E-Voting.')}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={handleUlangiSimulasi}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('sm.redo', 'Ulangi Simulasi')}</span>
              </button>
              <Link
                href="/voting"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95"
              >
                <Vote className="w-4 h-4" />
                <span>{t('pg.sim_to_official', 'Ke E-Voting Resmi')}</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              >
                <span>{t('sm.to_home', 'Kembali ke Beranda')}</span>
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
              <span className="font-black">{t('sm.booth_banner_a', 'Mode Simulasi Aktif')}</span>{' '}
              {t('sm.booth_banner_b', '— Pilihan Anda tidak akan disimpan ke database maupun penyimpanan lokal.')}
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
                  {simSession?.nama_mhs || t('sm.participant', 'Peserta Simulasi')}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {t('ui.nim', 'NIM')}: {simSession?.nim || 'DEMO-001'} •{' '}
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">{t('sm.mode_label', 'Mode Simulasi')}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleKeluarBilik}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('sm.exit', 'Keluar Simulasi')}</span>
            </button>
          </div>

          <div className="text-center space-y-2 pt-2">
            <h1 className="text-2xl sm:text-4xl font-black text-amber-950 dark:text-zinc-100 tracking-tight">
              {t('sm.booth_title', 'Bilik Simulasi Pemilihan')}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              {t('sm.booth_desc', 'Geser kartu paslon untuk membandingkan calon, perbesar untuk meninjau visi-misi, lalu coba pilih salah satu.')}
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
                <span>{t('sm.pick', 'Pilih Simulasi No. {n}', { n: paslon.nomor_urut })}</span>
              </button>
            )}
            emptyTitle={t('vt.booth_empty_title', 'Belum Ada Pasangan Calon Resmi')}
            emptyDesc={t('vt.booth_empty_desc', 'Panitia KPU belum menetapkan daftar pasangan calon untuk pemilu saat ini.')}
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
                  {t('sm.confirm_title', 'Konfirmasi Pilihan Simulasi')}
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
                  {t('ui.paslon_card_title', 'Pasangan Calon No. {n}', { n: selectedPaslon.nomor_urut })}
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
                <span>{t('sm.remember', 'Ingat — Ini Mode Simulasi:')}</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {t('sm.remember_a', 'Pilihan ini')}{' '}
                <strong>{t('sm.remember_b', 'tidak disimpan')}</strong>{' '}
                {t('sm.remember_c', 'ke database maupun penyimpanan lokal. Tidak ada efek pada hasil pemilihan resmi.')}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                {t('vt.cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleConfirmSimulasi}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{t('sm.yes_continue', 'Ya, Lanjutkan Simulasi')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
