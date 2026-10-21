'use client';

import { useState, useEffect } from 'react';
import { Compass, X, ArrowDown } from 'lucide-react';
import { TIMING_CONFIG } from '@/lib/timingConfig';
import { useTranslation } from '@/hooks/useTranslation';

export default function MobileNavHint() {
  const { t } = useTranslation();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('kpu_mobile_nav_hint_seen');
      if (!seen) {
        // Tampilkan dengan delay agar muncul setelah SiteOpening selesai
        const timer = setTimeout(() => {
          setShowHint(true);
        }, TIMING_CONFIG.MOBILE_NAV_HINT_DELAY);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    setShowHint(false);
    try {
      sessionStorage.setItem('kpu_mobile_nav_hint_seen', 'true');
    } catch (e) {
      // ignore
    }
  };

  if (!showHint) return null;

  return (
    <aside
      aria-label="Petunjuk Navigasi Mobile"
      className="md:hidden fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-400 ease-out pointer-events-auto"
    >
      <div className="relative p-3.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.6)] space-y-2">
        {/* Header Hint */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {t('hint.title', 'Navigasi Halaman')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Tutup petunjuk navigasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Teks Petunjuk */}
        <p className="text-[11.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {t('hint.desc', 'Menu utama dan bilik voting tersedia melalui panel navigasi di bagian bawah layar Anda.')}
        </p>

        {/* Action Button & Panah Arah ke Navbar Bawah */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {t('hint.btn', 'Mengerti')}
          </button>

          {/* Elemen tanda panah terarah ke navbar bawah */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            <span>Lihat ke bawah</span>
            <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-bounce" />
          </div>
        </div>

        {/* Segitiga pointer yang mengarah langsung ke navbar di bawah */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-zinc-900/95 border-b border-r border-zinc-200 dark:border-zinc-800 rotate-45 pointer-events-none" />
      </div>
    </aside>
  );
}
