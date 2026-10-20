'use client';

import { useState, useEffect, useRef } from 'react';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import { Clock, CheckCircle2 } from 'lucide-react';
import { TIMELINE_KPU_ITEMS, computeTimelineStatus } from '@/utils/timelineUtils';

export default function TimelineSection() {
  const sectionRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const [isInView, setIsInView] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [nowDate, setNowDate] = useState(() => new Date());

  // 1. Perbarui tanggal saat component mount
  useEffect(() => {
    setNowDate(new Date());
  }, []);

  // 2. IntersectionObserver: Hanya aktifkan animasi garis saat section ada di viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px 50px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 3. Scroll Listener: Jeda animasi garis putus-putus saat user sedang scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Animasi garis dijeda jika section TIDAK di viewport ATAU sedang discroll
  const isAnimationPaused = !isInView || isScrolling;

  // Hitung status dinamis untuk setiap agenda
  const timelineItems = TIMELINE_KPU_ITEMS.map((item) => ({
    ...item,
    status: computeTimelineStatus(item.tanggal, nowDate),
  }));

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col justify-between pt-16 sm:pt-24 pb-0 bg-blue-50/80 dark:bg-[#0b0f19]/85 backdrop-blur-[1px] text-zinc-900 dark:text-zinc-100 transition-colors"
    >
      <div className="max-w-7xl mx-auto w-full my-auto space-y-14 px-4 sm:px-6 lg:px-12">
        {/* Header Section Timeline */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-blue-200/80 dark:border-zinc-800 text-blue-800 dark:text-blue-400 text-xs font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span>Jadwal Resmi KPU 2026</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            Timeline Kegiatan KPU 2026
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Rangkaian tanggal pelaksanaan dari pendaftaran calon hingga hari pemungutan suara Pemilihan Umum Raya Mahasiswa Politeknik LP3I.
          </p>
        </div>

        {/* GRID TIMELINE ZIG-ZAG:
            - Mobile: 2 div per baris (grid-cols-2) -> 01->02 (turun) 03<-04 (turun) 05->06 (turun) 07<-08
            - Desktop: 4 div per baris (lg:grid-cols-4) -> 01->02->03->04 (turun) 05<-06<-07<-08
        */}
        <div
          className={`relative grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-14 ${
            isAnimationPaused ? 'dashed-lines-paused' : ''
          }`}
        >
          {timelineItems.map((item) => (
            <div
              key={item.no}
              className={`relative flex flex-col ${item.orderClass}`}
            >
              {/* KARTU JADWAL TIMELINE */}
              <div className="relative z-10 h-full p-4 sm:p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-200/80 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group overflow-hidden">
                <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-xl group-hover:bg-blue-500/25 transition-all" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-600 dark:from-blue-600 dark:to-indigo-500 text-white font-black flex items-center justify-center text-sm sm:text-base shadow-sm group-hover:scale-105 transition-transform">
                      {item.no}
                    </div>

                    {/* Status Badge: Aktif, Selesai, atau Mendatang (Status Puncak Acara sudah dihapus) */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'Aktif'
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : item.status === 'Selesai'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-blue-700 dark:text-blue-400 tracking-wide pt-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.tanggal}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {item.judul}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-blue-100/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold">Agenda #{item.no}</span>
                  <CheckCircle2
                    className={`w-3.5 h-3.5 transition-opacity ${
                      item.status === 'Selesai'
                        ? 'text-emerald-600 dark:text-emerald-400 opacity-100'
                        : 'text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100'
                    }`}
                  />
                </div>
              </div>

              {/* CONNECTOR GARIS PUTUS-PUTUS DESKTOP (lg: 4 div per baris) */}
              {item.desktopLine === 'right' && (
                <div
                  aria-hidden="true"
                  className="hidden lg:flex items-center absolute top-1/2 -right-10 w-10 -translate-y-1/2 z-0 pointer-events-none"
                >
                  <div className="w-full h-[3px] dashed-line-right" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -ml-1 shadow-[0_0_8px_#3b82f6]" />
                </div>
              )}

              {item.desktopLine === 'down' && (
                <div
                  aria-hidden="true"
                  className="hidden lg:flex flex-col items-center absolute -bottom-14 left-1/2 h-14 -translate-x-1/2 z-0 pointer-events-none"
                >
                  <div className="h-full w-[3px] dashed-line-down" />
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 -mt-1 shadow-[0_0_8px_#3b82f6]" />
                </div>
              )}

              {item.desktopLine === 'left' && (
                <div
                  aria-hidden="true"
                  className="hidden lg:flex items-center absolute top-1/2 -left-10 w-10 -translate-y-1/2 z-0 pointer-events-none"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -mr-1 z-10 shadow-[0_0_8px_#3b82f6]" />
                  <div className="w-full h-[3px] dashed-line-left" />
                </div>
              )}

              {/* CONNECTOR GARIS PUTUS-PUTUS MOBILE (< lg: 2 div per baris) */}
              {item.mobileLine === 'right' && (
                <div
                  aria-hidden="true"
                  className="flex lg:hidden items-center absolute top-1/2 -right-6 sm:-right-10 w-6 sm:w-10 -translate-y-1/2 z-0 pointer-events-none"
                >
                  <div className="w-full h-[3px] dashed-line-right" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -ml-1 shadow-[0_0_8px_#3b82f6]" />
                </div>
              )}

              {item.mobileLine === 'down' && (
                <div
                  aria-hidden="true"
                  className="flex lg:hidden flex-col items-center absolute -bottom-10 sm:-bottom-14 left-1/2 h-10 sm:h-14 -translate-x-1/2 z-0 pointer-events-none"
                >
                  <div className="h-full w-[3px] dashed-line-down" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -mt-1 shadow-[0_0_8px_#3b82f6]" />
                </div>
              )}

              {item.mobileLine === 'left' && (
                <div
                  aria-hidden="true"
                  className="flex lg:hidden items-center absolute top-1/2 -left-6 sm:-left-10 w-6 sm:w-10 -translate-y-1/2 z-0 pointer-events-none"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -mr-1 z-10 shadow-[0_0_8px_#3b82f6]" />
                  <div className="w-full h-[3px] dashed-line-left" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sambungan Gelombang Menuju Section 3 (Tahapan Pemilihan Umum Mahasiswa) */}
      <div className="w-full -mb-px mt-16 sm:mt-20 leading-none">
        <BgWaveDivider className="w-full text-white/60 dark:text-black/60" />
      </div>
    </section>
  );
}
