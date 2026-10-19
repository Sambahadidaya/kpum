'use client';

import { useState, useRef, useEffect } from 'react';
import PaslonCard from '@/components/public/PaslonCard';
import PaslonFullscreenModal from '@/components/public/PaslonFullscreenModal';
import { ChevronLeft, ChevronRight, Vote, SlidersHorizontal } from 'lucide-react';

export default function PaslonSlider({
  paslonList = [],
  renderAction = null,
  emptyTitle = 'Belum Ada Pasangan Calon',
  emptyDesc = 'Daftar pasangan calon akan segera diumumkan setelah penetapan nomor urut oleh panitia KPU.',
}) {
  const [selectedPaslon, setSelectedPaslon] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  // Perbarui current index saat user menggeser (scroll)
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    if (clientWidth === 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    setCurrentIndex(newIndex);
  };

  const scrollToIndex = (index) => {
    if (!sliderRef.current) return;
    const target = Math.max(0, Math.min(paslonList.length - 1, index));
    const cardWidth = sliderRef.current.clientWidth;
    sliderRef.current.scrollTo({
      left: target * cardWidth,
      behavior: 'smooth',
    });
    setCurrentIndex(target);
  };

  const handlePrev = () => scrollToIndex(currentIndex - 1);
  const handleNext = () => scrollToIndex(currentIndex + 1);

  if (paslonList.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto">
          <Vote className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          {emptyTitle}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {emptyDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* Bar Header Navigasi Slider */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <span>
            Paslon {currentIndex + 1} dari {paslonList.length}
          </span>
        </div>

        {/* Tombol Geser Kiri / Kanan */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer active:scale-95"
            aria-label="Geser ke Paslon Sebelumnya"
            title="Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= paslonList.length - 1}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer active:scale-95"
            aria-label="Geser ke Paslon Berikutnya"
            title="Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Container Carousel Horizontal Swipeable */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-4 sm:gap-6 py-2 px-1 focus:outline-hidden"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {paslonList.map((paslon, idx) => (
          <div
            key={paslon.id || idx}
            className="shrink-0 w-full snap-center"
          >
            <PaslonCard
              paslon={paslon}
              onEnlarge={(p) => setSelectedPaslon(p)}
              actionButton={renderAction ? renderAction(paslon) : null}
            />
          </div>
        ))}
      </div>

      {/* Indikator Titik (Dots Indicator) */}
      {paslonList.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {paslonList.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => scrollToIndex(dotIdx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                dotIdx === currentIndex
                  ? 'w-7 bg-zinc-900 dark:bg-zinc-100'
                  : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
              }`}
              aria-label={`Lihat Paslon ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Modal Fullscreen Detail Paslon */}
      {selectedPaslon && (
        <PaslonFullscreenModal
          paslon={selectedPaslon}
          onClose={() => setSelectedPaslon(null)}
        />
      )}
    </div>
  );
}
