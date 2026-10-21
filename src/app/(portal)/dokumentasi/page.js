'use client';

import { useState, useEffect, useRef } from 'react';
import { getPublikDokumentasi } from '@/api/publlic/dokumentasi';
import { formatTanggalIndo } from '@/utils/dateUtils';
import { getGoogleDriveEmbedUrl } from '@/utils/driveUtils';
import {
  FolderKanban,
  Calendar,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';

import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedData } from '@/hooks/useTranslatedData';
import TranslatingNotice from '@/components/public/TranslatingNotice';

export default function DokumentasiPortalPage() {
  const { t } = useTranslation();
  const { data: dokumentasiList, loading, translating } = useTranslatedData('dokumentasi', getPublikDokumentasi);
  const [previewItem, setPreviewItem] = useState(null);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center transition-colors">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
            <FolderKanban className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>{t('dokumentasi.badge', 'Arsip Dokumentasi Kegiatan')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            {t('dokumentasi.title', 'Galeri Dokumentasi Pemilu')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {t(
              'dokumentasi.subtitle',
              'Geser atau gulir ke samping (horizontal) untuk melihat arsip dokumentasi kegiatan KPU Mahasiswa.'
            )}
          </p>
        </div>

        {/* Scroll Control Arrows (Desktop & Mobile) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-blue-950 dark:text-zinc-300 border border-blue-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer shadow-xs"
            aria-label={t('pg.dok_scroll_left', 'Geser ke kiri')}
          >
            <ChevronLeft className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-blue-950 dark:text-zinc-300 border border-blue-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer shadow-xs"
            aria-label={t('pg.dok_scroll_right', 'Geser ke kanan')}
          >
            <ChevronRight className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Container */}
      {loading && translating ? (
        <TranslatingNotice show fullHeight />
      ) : loading ? (
        <div className="flex gap-6 overflow-x-hidden py-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-[280px] sm:w-[340px] shrink-0 h-96 rounded-3xl bg-blue-50/40 dark:bg-zinc-900/50 border border-blue-100 dark:border-zinc-800 animate-pulse p-6"
            />
          ))}
        </div>
      ) : dokumentasiList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 max-w-md mx-auto space-y-3 shadow-xs">
          <FolderKanban className="w-12 h-12 text-blue-300 dark:text-zinc-600 mx-auto" />
          <h2 className="text-base font-bold text-blue-950 dark:text-zinc-100">
            {t('dokumentasi.empty_title', 'Belum Ada Dokumentasi')}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {t('dokumentasi.empty_desc', 'Dokumentasi kegiatan akan segera ditambahkan oleh panitia.')}
          </p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'thin' }}
        >
          {dokumentasiList.map((item, idx) => (
            <div
              key={item.id || idx}
              className="snap-start shrink-0 w-[280px] sm:w-[350px] rounded-3xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 p-6 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Header Card */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400">
                  <FolderKanban className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{formatTanggalIndo(item.tanggal_dokumentasi)}</span>
                  </div>

                  <h3 className="text-lg font-bold text-blue-950 dark:text-zinc-100 line-clamp-2 leading-snug">
                    {item.judul_dokumentasi}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {item.deskripsi || t('pg.dok_default_desc', 'Dokumentasi arsip foto resmi kegiatan Komisi Pemilihan Umum Mahasiswa LP3I.')}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Tombol Preview dan Tombol Lihat GDrive di bawahnya */}
              <div className="pt-6 border-t border-blue-100 dark:border-zinc-800 space-y-2.5">
                {/* Tombol Preview Cuplikan Foto */}
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white text-xs font-semibold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t('pg.dok_preview', 'Preview Cuplikan Foto')}</span>
                </button>

                {/* Tombol Lihat Google Drive */}
                <a
                  href={item.link_drive}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-950 border border-blue-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-800 text-xs font-semibold transition active:scale-95"
                >
                  <ExternalLink className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>{t('pg.dok_open_drive', 'Buka di Google Drive')}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Iframe Embed Preview Google Drive */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-50 dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-md">
                  {previewItem.judul_dokumentasi}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Iframe Preview */}
            <div className="flex-1 bg-zinc-100 dark:bg-black relative">
              {getGoogleDriveEmbedUrl(previewItem.link_drive) ? (
                <iframe
                  src={getGoogleDriveEmbedUrl(previewItem.link_drive)}
                  title={previewItem.judul_dokumentasi}
                  className="w-full h-full border-none"
                  allow="autoplay"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
                  <FileText className="w-12 h-12" />
                  <p className="text-xs">{t('pg.dok_preview_fail', 'Pratinjau tidak dapat dimuat langsung.')}</p>
                  <a
                    href={previewItem.link_drive}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-900 dark:text-zinc-100 underline font-semibold"
                  >
                    {t('pg.dok_open_drive_direct', 'Buka langsung di Google Drive')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
