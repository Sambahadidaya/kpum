'use client';

import Image from 'next/image';
import {
  UserCheck,
  GraduationCap,
  Maximize2,
  CheckCircle2,
  Quote,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PaslonCard({ paslon, onEnlarge, actionButton = null }) {
  const { t } = useTranslation();
  const k1 = paslon.kandidat1 || {};
  const k2 = paslon.kandidat2;
  const detail1 = k1.detail_kandidat || {};
  const detail2 = k2?.detail_kandidat || {};

  return (
    <div
      onClick={() => onEnlarge && onEnlarge(paslon)}
      className="group relative rounded-3xl bg-white/95 dark:bg-zinc-950/95 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs hover:shadow-xl transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between cursor-pointer w-full"
    >
      {/* Soft Glow Ambient Netral */}
      <div className="absolute inset-0 z-0 pointer-events-none rounded-3xl opacity-15 dark:opacity-10 transition-opacity duration-300 group-hover:opacity-30 bg-[radial-gradient(circle_at_80%_20%,rgba(113,113,122,0.2),transparent_70%)]" />

      {/* Konten Card Horizontal Panjang */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-between p-4 sm:p-5 md:p-6 gap-4 sm:gap-6">
        {/* Bagian Kiri: Informasi Nomor Urut, Nama Kedua Kandidat, & Slogan */}
        <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
          <div className="space-y-2">
            {/* Top Bar: Nomor Urut & Status */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex flex-col items-center justify-center shrink-0 shadow-xs">
                <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 leading-none">
                  {t('ui.paslon_no', 'NO')}
                </span>
                <span className="text-base sm:text-lg font-black leading-none mt-0.5">
                  {paslon.nomor_urut}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {t('ui.paslon_official', 'Paslon Resmi BEM')}
                </span>
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
                  {t('ui.paslon_card_title', 'Pasangan Calon No. {n}', { n: paslon.nomor_urut })}
                </h3>
              </div>
            </div>

            {/* Nama & Info Kedua Calon Berdampingan/Stacked */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1">
              {/* Capresma */}
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                  {t('ui.capresma', 'Capresma')}
                </span>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {k1.nama_kandidat || '-'}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">
                  {k1.nim_kandidat} • {k1.prodi_kandidat}
                </p>
              </div>

              {/* Cawapresma */}
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                  {t('ui.cawapresma', 'Cawapresma')}
                </span>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {k2?.nama_kandidat || t('ui.single_candidacy', 'Pencalonan Tunggal')}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">
                  {k2 ? `${k2.nim_kandidat} • ${k2.prodi_kandidat}` : '-'}
                </p>
              </div>
            </div>

            {/* Slogan atau Visi Singkat */}
            {paslon.slogan ? (
              <div className="flex items-start gap-2 pt-1 text-xs text-zinc-600 dark:text-zinc-400 italic">
                <Quote className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <p className="line-clamp-2">&ldquo;{paslon.slogan}&rdquo;</p>
              </div>
            ) : (detail1.visi || detail2.visi) ? (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 italic pt-1">
                &ldquo;{detail1.visi || detail2.visi}&rdquo;
              </p>
            ) : null}
          </div>

          {/* Footer Card: Tombol Perbesar & Tombol Aksi Tambahan */}
          <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onEnlarge) onEnlarge(paslon);
              }}
              className="relative z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition active:scale-95 cursor-pointer shadow-2xs"
              title={t('ui.enlarge_title', 'Perbesar Profil & Visi Misi')}
            >
              <Maximize2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              <span>{t('ui.enlarge_detail', 'Perbesar Detail')}</span>
            </button>

            {actionButton && (
              <div
                className="relative z-20 flex-1 sm:flex-none"
                onClick={(e) => e.stopPropagation()}
              >
                {actionButton}
              </div>
            )}
          </div>
        </div>

        {/* Bagian Kanan: 2 Foto Kandidat Berdampingan */}
        <div className="shrink-0 flex items-center justify-center gap-2 sm:gap-3">
          {/* Foto Capres */}
          <div className="relative w-24 sm:w-28 md:w-32 aspect-3/4 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs flex items-end justify-center">
            {k1.fotodiri_kandidat ? (
              <Image
                src={k1.fotodiri_kandidat}
                alt={k1.nama_kandidat || 'Capres'}
                fill
                sizes="(max-width: 768px) 112px, 128px"
                className="transition-transform duration-500 group-hover:scale-105 object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                <UserCheck className="w-7 h-7 opacity-40 mb-1" />
                <span className="text-[8px] font-mono">{t('ui.capres', 'Capres')}</span>
              </div>
            )}
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 text-[8px] font-bold text-white tracking-wide">
              {t('ui.capres', 'Capres')}
            </span>
          </div>

          {/* Foto Cawapres */}
          <div className="relative w-24 sm:w-28 md:w-32 aspect-3/4 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs flex items-end justify-center">
            {k2?.fotodiri_kandidat ? (
              <Image
                src={k2.fotodiri_kandidat}
                alt={k2.nama_kandidat || 'Cawapres'}
                fill
                sizes="(max-width: 768px) 112px, 128px"
                className="transition-transform duration-500 group-hover:scale-105 object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                <UserCheck className="w-7 h-7 opacity-40 mb-1" />
                <span className="text-[8px] font-mono">{t('ui.cawapres', 'Cawapres')}</span>
              </div>
            )}
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 text-[8px] font-bold text-white tracking-wide">
              {t('ui.cawapres', 'Cawapres')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
