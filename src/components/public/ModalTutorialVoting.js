'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  X,
  Check,
  CheckCircle2,
  Video,
  Info,
  ExternalLink,
  Layers,
  MonitorPlay,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getYouTubeEmbedUrl } from '@/utils/youtubeUtils';
import { getGoogleDriveEmbedUrl } from '@/utils/driveUtils';

import imgStep1 from '@/aseets/panduanVoting/1.png';
import imgStep2 from '@/aseets/panduanVoting/2.png';
import imgStep3 from '@/aseets/panduanVoting/3.png';
import imgStep4 from '@/aseets/panduanVoting/4.png';

const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const AUTO_SLIDE_DURATION = 5000; // 5 detik

export default function ModalTutorialVoting({
  isOpen,
  onClose,
  videoUrl = DEFAULT_VIDEO_URL,
  initialStep = 0,
}) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resolvedVideo, setResolvedVideo] = useState(videoUrl);
  const [showScrollDown, setShowScrollDown] = useState(true);

  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const progressIntervalRef = useRef(null);
  const contentScrollRef = useRef(null);
  const textSectionRef = useRef(null);

  // Ambil link video resmi dari database panduan jika ada
  useEffect(() => {
    if (videoUrl && videoUrl !== DEFAULT_VIDEO_URL) {
      setResolvedVideo(videoUrl);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const { getPublikPanduan } = await import('@/api/publlic/panduan');
        const res = await getPublikPanduan('id');
        if (res?.success && Array.isArray(res.data)) {
          for (const p of res.data) {
            const found = p.items?.find((item) => item.link_vidio && item.link_vidio.trim() !== '');
            if (found && isMounted) {
              setResolvedVideo(found.link_vidio);
              break;
            }
          }
        }
      } catch (e) {
        // abaikan error dan gunakan default
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  // Daftar slide tutorial (4 gambar + 1 video di akhir)
  const steps = [
    {
      id: 1,
      type: 'image',
      image: imgStep1,
      title: t('tutorial.step1_title', 'Langkah 1: Masuk & Verifikasi Pemilih'),
      desc: t(
        'tutorial.step1_desc',
        'Masukkan Nomor Induk Mahasiswa (NIM) dan Kode Token Voting resmi yang didapatkan dari Panitia KPU.'
      ),
      points: [
        t('tutorial.step1_point1', 'Ketik NIM atau ID Mahasiswa Anda yang terdaftar resmi pada DPT.'),
        t(
          'tutorial.step1_point2',
          'Masukkan kode token voting rahasia yang telah divalidasi oleh panitia (pada mode simulasi kode terisi otomatis).'
        ),
        t(
          'tutorial.step1_point3',
          'Periksa status bilik suara dan hitung mundur waktu yang tersisa sebelum bilik ditutup.'
        ),
        t(
          'tutorial.step1_point4',
          'Tekan tombol \'Masuk ke Bilik Suara\' untuk melanjutkan ke tahapan pemilihan.'
        ),
      ],
    },
    {
      id: 2,
      type: 'image',
      image: imgStep2,
      title: t('tutorial.step2_title', 'Langkah 2: Eksplorasi Pasangan Calon (Paslon)'),
      desc: t(
        'tutorial.step2_desc',
        'Bandingkan profil, visi, misi, dan program kerja unggulan dari setiap pasangan calon sebelum menentukan pilihan.'
      ),
      points: [
        t(
          'tutorial.step2_point1',
          'Gunakan tombol navigasi panah kiri/kanan atau geser layar untuk menjelajahi seluruh paslon.'
        ),
        t(
          'tutorial.step2_point2',
          'Periksa foto resmi calon, nama lengkap Capresma & Cawapresma, serta program studinya.'
        ),
        t(
          'tutorial.step2_point3',
          'Klik tombol \'Perbesar Detail\' untuk membaca rincian visi, misi, dan program kerja secara komprehensif.'
        ),
        t(
          'tutorial.step2_point4',
          'Jika Anda telah yakin dengan pasangan calon pilihan Anda, klik tombol \'Pilih Paslon\'.'
        ),
      ],
    },
    {
      id: 3,
      type: 'image',
      image: imgStep3,
      title: t('tutorial.step3_title', 'Langkah 3: Konfirmasi & Validasi Pilihan'),
      desc: t(
        'tutorial.step3_desc',
        'Sistem menampilkan pop-up konfirmasi untuk memastikan Anda tidak salah memilih nomor urut pasangan calon.'
      ),
      points: [
        t(
          'tutorial.step3_point1',
          'Tinjau kembali nomor urut serta nama pasangan calon yang tertera di kotak konfirmasi.'
        ),
        t(
          'tutorial.step3_point2',
          'Pastikan pilihan Anda telah benar-benar mantap dan sesuai dengan hati nurani.'
        ),
        t(
          'tutorial.step3_point3',
          'Klik tombol \'Batal\' jika ingin mengubah pilihan Anda ke pasangan calon lain.'
        ),
        t(
          'tutorial.step3_point4',
          'Klik tombol \'Ya, Lanjutkan\' untuk memproses dan mengunci suara Anda ke server.'
        ),
      ],
    },
    {
      id: 4,
      type: 'image',
      image: imgStep4,
      title: t('tutorial.step4_title', 'Langkah 4: Rekapitulasi Suara Berhasil'),
      desc: t(
        'tutorial.step4_desc',
        'Suara Anda telah sukses tercatat secara aman, rahasia, dan langsung masuk ke sistem tabulasi pemilu.'
      ),
      points: [
        t(
          'tutorial.step4_point1',
          'Muncul notifikasi bahwa hak suara Anda telah berhasil digunakan dan tercatat di database.'
        ),
        t(
          'tutorial.step4_point2',
          'Setiap akun pemilih hanya dapat melakukan pemilihan 1 kali untuk menjamin integritas pemilu.'
        ),
        t(
          'tutorial.step4_point3',
          'Pada mode simulasi, Anda dapat menekan \'Ulangi Simulasi\' kapan saja untuk mencoba kembali.'
        ),
        t(
          'tutorial.step4_point4',
          'Klik \'Kembali ke Beranda\' untuk mengakhiri sesi pemungutan suara dengan aman.'
        ),
      ],
    },
    {
      id: 5,
      type: 'video',
      videoUrl: resolvedVideo || DEFAULT_VIDEO_URL,
      title: t('tutorial.step5_title', 'Langkah 5: Video Tutorial Lengkap'),
      desc: t(
        'tutorial.step5_desc',
        'Simak tayangan video simulasi pemungutan suara untuk pemahaman visual yang lebih menyeluruh.'
      ),
      points: [
        t(
          'tutorial.step5_point1',
          'Tonton pemutaran video demonstrasi bilik suara elektronik di atas secara seksama.'
        ),
        t(
          'tutorial.step5_point2',
          'Video menampilkan simulasi alur riil mulai dari proses autentikasi hingga surat suara terkirim.'
        ),
        t(
          'tutorial.step5_point3',
          'Bila video tidak termuat otomatis, Anda dapat mengklik tautan \'Buka Video di Tab Baru\'.'
        ),
        t(
          'tutorial.step5_point4',
          'Klik tombol \'Selesai & Tutup\' di bawah untuk menutup panduan dan memulai proses pemilihan Anda.'
        ),
      ],
    },
  ];

  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const isVideoStep = steps[currentStep]?.type === 'video';

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
    setProgress(0);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentStep, totalSteps, onClose]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setProgress(0);
  }, []);

  // Deteksi scroll untuk menyembunyikan / menampilkan tombol panah bawah
  const handleContentScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 20) {
      setShowScrollDown(false);
    } else {
      setShowScrollDown(true);
    }
  };

  // Reset scroll & kembalikan tombol petunjuk saat berganti step
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
    setShowScrollDown(true);
  }, [currentStep]);

  // Aksi saat user mengklik tombol panah bawah: scroll otomatis ke bawah dan sembunyikan tombol
  const scrollToDetail = () => {
    setShowScrollDown(false);
    if (textSectionRef.current) {
      textSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({
        top: 240,
        behavior: 'smooth',
      });
    }
  };

  // Lock body scroll saat modal aktif
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Auto-advance timer (5 detik per slide, dijeda pada video slide atau saat di-hover)
  useEffect(() => {
    if (!isOpen || isPaused || isVideoStep) {
      setProgress(0);
      return;
    }

    const intervalStepTime = 50; // update progress bar setiap 50ms
    const totalTicks = AUTO_SLIDE_DURATION / intervalStepTime;
    let tickCount = 0;

    progressIntervalRef.current = setInterval(() => {
      tickCount += 1;
      const currentPct = Math.min(100, (tickCount / totalTicks) * 100);
      setProgress(currentPct);

      if (tickCount >= totalTicks) {
        clearInterval(progressIntervalRef.current);
        setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
        setProgress(0);
      }
    }, intervalStepTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isOpen, isPaused, isVideoStep, currentStep, totalSteps]);

  // Touch Swipe Handlers untuk perangkat mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left -> Next
        handleNext();
      } else {
        // Swipe right -> Prev
        handlePrev();
      }
    }
  };

  if (!isOpen) return null;

  const currentItem = steps[currentStep];
  const activeVideoUrl = currentItem.type === 'video' ? currentItem.videoUrl : null;
  const youtubeEmbed = activeVideoUrl ? getYouTubeEmbedUrl(activeVideoUrl) : null;
  const driveEmbed = activeVideoUrl && !youtubeEmbed ? getGoogleDriveEmbedUrl(activeVideoUrl) : null;
  const resolvedEmbedUrl = youtubeEmbed || driveEmbed;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tutorial-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Backdrop Klik untuk Tutup */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Container Modal Netral & Modern */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-xl sm:max-w-2xl md:max-w-3xl max-h-[92vh] sm:max-h-[90vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl z-10 text-zinc-900 dark:text-zinc-100 transition-colors"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center text-xs font-black">
              {currentStep + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="modal-tutorial-title"
                  className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight"
                >
                  {t('tutorial.modal_title', 'Tutorial Alur Pemilihan')}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Layers className="w-3 h-3" />
                  {t('tutorial.step_counter', 'Langkah {current} dari {total}', {
                    current: currentStep + 1,
                    total: totalSteps,
                  })}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                {!isVideoStep
                  ? t('tutorial.auto_play_tip', 'Geser otomatis: 5 dtk')
                  : t('tutorial.video_badge', 'Video Panduan')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Tombol Kembali ke Awal (tersedia di setiap slide) */}
            <button
              type="button"
              onClick={handleRestart}
              disabled={currentStep === 0}
              title={t('tutorial.btn_restart', 'Kembali ke Awal')}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
                currentStep === 0
                  ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('tutorial.btn_restart', 'Awal')}</span>
            </button>

            {/* Tombol Lewati Tutorial (tersedia di setiap slide) */}
            <button
              type="button"
              onClick={onClose}
              title={t('tutorial.btn_skip', 'Lewati Tutorial')}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
            >
              <span className="text-[11px]">{t('tutorial.btn_skip', 'Lewati')}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Indikator Progres Bar Tipis di bawah header */}
        <div className="w-full h-1 bg-zinc-200/60 dark:bg-zinc-800 shrink-0 overflow-hidden">
          <div
            className="h-full bg-zinc-800 dark:bg-zinc-200 transition-all duration-75"
            style={{
              width: isVideoStep ? '100%' : `${progress}%`,
            }}
          />
        </div>

        {/* Pemberitahuan Kesamaan Rangkaian Simulasi & Voting Resmi */}
        <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5 shrink-0">
          <Info className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
            {t(
              'tutorial.notice_text',
              'Pemberitahuan: Rangkaian tahapan pada mode Simulasi maupun Voting Resmi adalah sama persis.'
            )}
          </p>
        </div>

        {/* Area Visual & Teks Tutorial (Scrollable vertikal bila teks panjang) */}
        <div
          ref={contentScrollRef}
          onScroll={handleContentScroll}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-4 scroll-smooth"
        >
          {/* Visual: Gambar atau Video (dengan Border Modern) */}
          <div className="relative w-full aspect-16/9 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-black overflow-hidden shadow-xs flex items-center justify-center">
            {currentItem.type === 'image' ? (
              <Image
                src={currentItem.image}
                alt={currentItem.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-contain"
              />
            ) : (
              /* Slide Video Tutorial Menggantikan Gambar di Akhir */
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                {resolvedEmbedUrl ? (
                  <iframe
                    src={resolvedEmbedUrl}
                    title={currentItem.title}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <MonitorPlay className="w-10 h-10 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-400">
                      {t('tutorial.video_badge', 'Video Panduan Interaktif')}
                    </p>
                    {activeVideoUrl && (
                      <a
                        href={activeVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs hover:bg-zinc-700 transition"
                      >
                        <span>{t('tutorial.video_fallback_open', 'Buka Video di Tab Baru')}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bagian Teks Step-by-Step (Scrollable bila panjang) */}
          <div ref={textSectionRef} className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                {currentItem.type === 'video' ? (
                  <Video className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                )}
                <span>{currentItem.title}</span>
              </h3>

              {currentItem.type === 'video' && activeVideoUrl && (
                <a
                  href={activeVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 hover:underline shrink-0"
                >
                  <span>{t('tutorial.video_fallback_open', 'Buka Tab Baru')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {currentItem.desc}
            </p>

            {/* List Poin Step-by-Step */}
            <div className="space-y-2 pt-1">
              {currentItem.points.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/80"
                >
                  <div className="w-4 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300 leading-snug">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tombol Petunjuk Panah Bawah (Floating dengan transisi naik-turun / bounce) */}
        <div
          className={`absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 pointer-events-none ${
            showScrollDown
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={scrollToDetail}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/95 text-white dark:bg-zinc-100/95 dark:text-zinc-950 border border-zinc-700/60 dark:border-zinc-300/60 shadow-xl hover:bg-zinc-800 dark:hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce backdrop-blur-xs select-none"
            aria-label={t('tutorial.scroll_hint', 'Lihat Penjelasan di Bawah')}
          >
            <span>{t('tutorial.scroll_hint', 'Lihat Penjelasan di Bawah')}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer Navigasi Modal */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          {/* Tombol Sebelumnya */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              currentStep === 0
                ? 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
                : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('tutorial.btn_prev', 'Sebelumnya')}</span>
          </button>

          {/* Indikator Titik Step (Dapat Diklik) */}
          <div className="flex items-center gap-1.5">
            {steps.map((st, i) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setCurrentStep(i);
                  setProgress(0);
                }}
                title={st.title}
                className={`transition-all rounded-full cursor-pointer ${
                  currentStep === i
                    ? 'w-6 sm:w-7 h-2 bg-zinc-900 dark:bg-zinc-100'
                    : 'w-2 h-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-500'
                }`}
                aria-label={`Pindah ke langkah ${i + 1}`}
              />
            ))}
          </div>

          {/* Tombol Berikutnya atau Selesai (di slide akhir) */}
          {isLastStep ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition cursor-pointer active:scale-95 shadow-xs"
            >
              <span>{t('tutorial.btn_finish', 'Selesai & Tutup')}</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition cursor-pointer active:scale-95 shadow-xs"
            >
              <span>{t('tutorial.btn_next', 'Berikutnya')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { ModalTutorialVoting, ModalTutorialVoting as VotingTutorialModal };
