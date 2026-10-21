'use client';

import { Languages, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Notifikasi "AI sedang menerjemahkan" + animasi loading.
 * Tampil hanya saat `show` true (bahasa bukan Indonesia & data sedang dimuat/diterjemahkan).
 */
export default function TranslatingNotice({ show = false, fullHeight = false }) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full flex items-center justify-center ${fullHeight ? 'min-h-[40vh]' : 'py-4'}`}
    >
      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 shadow-xs backdrop-blur-md">
        <div className="relative w-9 h-9 shrink-0">
          <span className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-900" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin" />
          <Languages className="absolute inset-0 m-auto w-4 h-4 text-blue-700 dark:text-blue-300" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-blue-950 dark:text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
            {t('umum.ai_translating_title', 'AI sedang menerjemahkan...')}
          </p>
          <p className="text-[11px] text-blue-900/80 dark:text-zinc-400">
            {t(
              'umum.ai_translating_desc',
              'Konten sedang diterjemahkan ke bahasa pilihanmu. Hanya pertama kali, selanjutnya langsung tampil.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
