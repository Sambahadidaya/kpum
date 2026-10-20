'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logoKpu from '@/aseets/logo.png';
import { TIMING_CONFIG } from '@/lib/timingConfig';

export default function SiteOpening({ children }) {
  const pathname = usePathname();

  // Fase animasi: 'init' | 'dark' | 'slide' | 'expand' | 'fading' | 'done'
  const [phase, setPhase] = useState('init');
  const [renderChildren, setRenderChildren] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    // 1. Lewati opening jika di halaman login panitia
    if (pathname === '/panitia/login') {
      setPhase('done');
      setRenderChildren(true);
      return;
    }

    // 2. Cek apakah user sudah melihat opening di sesi browser ini
    try {
      const hasSeen = sessionStorage.getItem('kpu_site_opening_seen');
      if (hasSeen) {
        setPhase('done');
        setRenderChildren(true);
        return;
      }
    } catch (e) {
      // Abaikan jika sessionStorage dibatasi browser
    }

    // Kunci scroll saat opening berjalan
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Mulai alur opening:
    // Tahap 1: Layar Hitam Pekat (Phase: dark)
    setPhase('dark');
    setRenderChildren(false);

    // Tahap 2: Logo Meluncur dari Bawah ke Tengah (Phase: slide)
    const tSlide = setTimeout(() => {
      setPhase('slide');
    }, TIMING_CONFIG.OPENING_DARK_DELAY);

    // Tahap 3: Logo Perbesar & Munculkan 4 Border Berputar Bergantian (Phase: expand)
    const tExpand = setTimeout(() => {
      setPhase('expand');
    }, TIMING_CONFIG.OPENING_EXPAND_START);

    // Tahap 4: Mulai Fade Out & Mount Halaman Utama di Bawah Overlay
    const tFade = setTimeout(() => {
      setRenderChildren(true);
      setPhase('fading');
    }, TIMING_CONFIG.OPENING_FADE_OUT_START);

    // Tahap 5: Opening Selesai (Unmount Overlay & Kembalikan Scroll)
    const tDone = setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = originalOverflow;
      try {
        sessionStorage.setItem('kpu_site_opening_seen', 'true');
      } catch (e) {}
    }, TIMING_CONFIG.OPENING_TOTAL_DURATION);

    timersRef.current = [tSlide, tExpand, tFade, tDone];

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      document.body.style.overflow = originalOverflow;
    };
  }, [pathname]);

  const isOverlayVisible = phase !== 'done';
  const isExpandPhase = phase === 'expand' || phase === 'fading';
  const isFading = phase === 'fading';

  return (
    <>
      {/* OVERLAY OPENING SPLASH SCREEN */}
      {isOverlayVisible && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black transition-opacity duration-600 ease-in-out pointer-events-none select-none ${
            isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            <div
              className={`w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-3xl transition-all duration-1000 ${
                isExpandPhase ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
            />
          </div>

          {/* Kontainer Utama Animasi */}
          <div className="relative flex items-center justify-center">
            {/* 4 LAYER GARIS BORDER BERPUTAR (Hanya muncul saat phase 'expand' / membesar) */}
            <div
              className={`absolute flex items-center justify-center transition-all duration-700 ease-out ${
                isExpandPhase
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
            >
              {/* Layer 4: Baris Terluar -> Putar ke KANAN (Clockwise) */}
              <div className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-blue-500/25 border-t-blue-400 border-r-blue-500/40 animate-opening-spin-cw-1" />

              {/* Layer 3: Baris ke-3 -> Putar ke KIRI (Counter-Clockwise) */}
              <div className="absolute w-48 h-48 sm:w-58 sm:h-58 rounded-full border border-dashed border-zinc-500/35 border-b-blue-400/70 animate-opening-spin-ccw-2" />

              {/* Layer 2: Baris ke-2 -> Putar ke KANAN (Clockwise) */}
              <div className="absolute w-38 h-38 sm:w-46 sm:h-46 rounded-full border-2 border-indigo-500/30 border-l-blue-400/80 animate-opening-spin-cw-3" />

              {/* Layer 1: Baris ke-1 (Terdekat dari Logo) -> Putar ke KIRI (Counter-Clockwise) */}
              <div className="absolute w-28 h-28 sm:w-34 sm:h-34 rounded-full border border-dotted border-cyan-400/70 animate-opening-spin-ccw-4" />

              {/* Partikel Titik Cahaya Mengorbit -> Putar ke KANAN (Clockwise) */}
              <div className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full animate-opening-spin-dots pointer-events-none">
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
                <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
                <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              </div>
            </div>

            {/* Inner Ring Bingkai Logo */}
            <div
              className={`absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-black/80 border border-white/20 backdrop-blur-xs flex items-center justify-center shadow-2xl transition-all duration-700 ${
                isExpandPhase ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              }`}
            />

            {/* LOGO KPU UTAMA:
                - Saat 'init' / 'dark': diam di bawah layar (translate-y-[120vh]) tanpa transisi (tidak ada animasi dari tengah)
                - Saat 'slide': meluncur mulus dari bawah ke tengah (translate-y-0)
                - Saat 'expand' / 'fading': membesar di tengah (scale-110)
            */}
            <div
              className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-2 flex items-center justify-center drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] transform ${
                phase === 'init' || phase === 'dark'
                  ? 'translate-y-[120vh] opacity-0 scale-75 transition-none'
                  : phase === 'slide'
                  ? 'translate-y-0 opacity-100 scale-95 transition-all duration-800 ease-out'
                  : 'translate-y-0 opacity-100 scale-110 transition-all duration-700 ease-out'
              }`}
            >
              <Image
                src={logoKpu}
                alt="Logo KPU Mahasiswa"
                width={96}
                height={96}
                priority
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* KONTEN HALAMAN UTAMA:
          Hanya dirender setelah fase opening selesai / fade out dimulai,
          sehingga performa website tetap ringan tanpa beban render ganda di awal.
      */}
      {renderChildren ? children : null}
    </>
  );
}
