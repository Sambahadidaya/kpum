'use client';

import { useState, useMemo } from 'react';
import KandidatCard from '@/components/public/KandidatCard';
import KandidatFullscreenModal from '@/components/public/KandidatFullscreenModal';
import { Users, Info, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedData } from '@/hooks/useTranslatedData';
import { getPublikKandidat } from '@/api/publlic/kandidat';
import TranslatingNotice from '@/components/public/TranslatingNotice';

export default function KandidatPortalClient() {
  const { t } = useTranslation();
  const { data: kandidatList, loading, translating } = useTranslatedData('kandidat', getPublikKandidat);
  const [selectedKandidat, setSelectedKandidat] = useState(null);

  // Sorting: yang lolos seleksi (!is_eliminated) di atas, yang tereliminasi (is_eliminated) di bawah
  const sortedKandidat = useMemo(() => {
    return [...kandidatList].sort((a, b) => {
      const aElim = Boolean(a.is_eliminated);
      const bElim = Boolean(b.is_eliminated);
      if (aElim === bElim) return 0;
      return aElim ? 1 : -1;
    });
  }, [kandidatList]);

  const totalLolos = kandidatList.filter((k) => !k.is_eliminated).length;
  const totalEliminasi = kandidatList.filter((k) => k.is_eliminated).length;

  if (loading) {
    return translating ? (
      <TranslatingNotice show fullHeight />
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((n) => (
          <div key={n} className="h-56 rounded-3xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Banner Informasi Status Seleksi Pemilu */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 backdrop-blur-md shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-blue-950 dark:text-zinc-100">
              {t('kandidat.banner_title', 'Tahapan Seleksi Berkas & Verifikasi Kandidat')}
            </h2>
            <p className="text-[11px] sm:text-xs text-blue-900/80 dark:text-zinc-400 leading-relaxed">
              {t(
                'kandidat.banner_desc',
                'Saat ini KPU Mahasiswa sedang melaksanakan tahapan verifikasi berkas dan uji kualifikasi calon. Kandidat di bawah ini ditampilkan berdasarkan status hasil verifikasi seleksi.'
              )}
            </p>
          </div>
        </div>

        {/* Ringkasan Jumlah Status */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/50 text-[10px] sm:text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{totalLolos} {t('kandidat.lolos', 'Lolos')}</span>
          </span>
          {totalEliminasi > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-900/50 text-[10px] sm:text-xs font-bold shadow-2xs">
              <XCircle className="w-3.5 h-3.5" />
              <span>{totalEliminasi} {t('kandidat.tereliminasi', 'Tereliminasi')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Konten Daftar Card Kandidat Horizontal */}
      {sortedKandidat.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {t('kandidat.empty_title', 'Belum Ada Data Kandidat')}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t(
              'kandidat.empty_desc',
              'Daftar calon kandidat akan segera ditampilkan setelah tahapan pendaftaran dan verifikasi berkas dibuka oleh panitia.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {sortedKandidat.map((kandidat, idx) => (
            <KandidatCard
              key={kandidat.id || idx}
              kandidat={kandidat}
              onEnlarge={(k) => setSelectedKandidat(k)}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Detail Modal (Preview Zoom) */}
      {selectedKandidat && (
        <KandidatFullscreenModal
          kandidat={selectedKandidat}
          onClose={() => setSelectedKandidat(null)}
        />
      )}
    </div>
  );
}
