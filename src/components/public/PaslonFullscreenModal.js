'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  Compass,
  Target,
  Quote,
  Vote,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PaslonFullscreenModal({ paslon, onClose }) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!paslon) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [paslon, onClose]);

  if (!paslon) return null;

  const k1 = paslon.kandidat1 || {};
  const k2 = paslon.kandidat2;
  const detail1 = k1.detail_kandidat || {};
  const detail2 = k2?.detail_kandidat || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl z-10 transition-colors">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-black text-sm">
              {paslon.nomor_urut}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {t('ui.paslon_modal_title', 'Pasangan Calon Nomor Urut {n}', { n: paslon.nomor_urut })}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {t('ui.paslon_modal_sub', 'Calon Presiden & Wakil Presiden Mahasiswa')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
            aria-label={t('ui.close_detail', 'Tutup Detail')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Slogan */}
          {paslon.slogan && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
              <Quote className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {t('ui.slogan_main', 'Slogan & Gagasan Utama')}
                </span>
                <p className="text-xs sm:text-sm italic font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                  &ldquo;{paslon.slogan}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Profil Kedua Kandidat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kandidat 1 - Calon Presiden */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <div className="relative w-32 sm:w-36 aspect-4/5 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                {k1.fotodiri_kandidat ? (
                  <Image
                    src={k1.fotodiri_kandidat}
                    alt={k1.nama_kandidat || 'Capres'}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <UserCheck className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-bold text-white">
                  {t('ui.capresma', 'Capresma')}
                </span>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {t('ui.cand_president', 'Calon Presiden Mahasiswa')}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {k1.nama_kandidat}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">{t('ui.nim', 'NIM')}: {k1.nim_kandidat}</p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{k1.prodi_kandidat}</span>
                </p>
              </div>
            </div>

            {/* Kandidat 2 - Calon Wakil Presiden */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              {k2 ? (
                <>
                  <div className="relative w-32 sm:w-36 aspect-4/5 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                    {k2.fotodiri_kandidat ? (
                      <Image
                        src={k2.fotodiri_kandidat}
                        alt={k2.nama_kandidat || 'Cawapres'}
                        fill
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <UserCheck className="w-10 h-10" />
                      </div>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-bold text-white">
                      {t('ui.cawapresma', 'Cawapresma')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {t('ui.cand_vice', 'Calon Wakil Presiden')}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {k2.nama_kandidat}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">{t('ui.nim', 'NIM')}: {k2.nim_kandidat}</p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{k2.prodi_kandidat}</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 space-y-1">
                  <UserCheck className="w-10 h-10 opacity-40" />
                  <p className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
                    {t('ui.single_candidacy', 'Pencalonan Tunggal')}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {t('ui.single_candidacy_desc', 'Maju tanpa calon wakil presiden.')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Visi & Misi Lengkap */}
          <div className="space-y-4 pt-2">
            {/* Visi */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Compass className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h3>{t('ui.visi_paslon', 'Visi Paslon')}</h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                {detail1.visi || detail2.visi
                  ? `"${detail1.visi || detail2.visi}"`
                  : t('ui.visi_paslon_empty', 'Visi sedang dalam proses pemaparan debat terbuka.')}
              </p>
            </div>

            {/* Misi */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Target className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h3>{t('ui.misi_paslon', 'Misi Pokok')}</h3>
              </div>
              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {detail1.misi || detail2.misi || t('ui.misi_paslon_empty', 'Poin-poin program kerja akan disampaikan pada agenda kampanye resmi.')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <span>{t('ui.kpum_full', 'Komisi Pemilihan Umum Mahasiswa LP3I')}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold transition cursor-pointer"
          >
            {t('ui.close', 'Tutup')}
          </button>
        </div>
      </div>
    </div>
  );
}
