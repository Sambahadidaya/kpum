'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  UserCheck,
  GraduationCap,
  X,
} from 'lucide-react';
import { recordTrafikSosmed } from '@/api/publlic/panitia';

/**
 * Helper untuk memformat URL sosial media
 */
function formatSosmedLink(type, input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  switch (type) {
    case 'whatsapp': {
      let clean = trimmed.replace(/\D/g, '');
      if (clean.startsWith('0')) clean = '62' + clean.slice(1);
      return `https://wa.me/${clean}`;
    }
    case 'instagram': {
      const clean = trimmed.replace(/^@/, '');
      return `https://instagram.com/${clean}`;
    }
    case 'tiktok': {
      const clean = trimmed.replace(/^@/, '');
      return `https://www.tiktok.com/@${clean}`;
    }
    case 'threads': {
      const clean = trimmed.replace(/^@/, '');
      return `https://www.threads.net/@${clean}`;
    }
    default:
      return trimmed;
  }
}

export default function PanitiaFullscreenModal({ panitia, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC key listener dan body scroll lock
  useEffect(() => {
    if (!panitia) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [panitia, onClose]);

  if (!mounted || !panitia) return null;

  const sosmedItem = Array.isArray(panitia.sosmed_panitia) && panitia.sosmed_panitia.length > 0
    ? panitia.sosmed_panitia[0]
    : (panitia.sosmed_panitia || {});

  const waLink = formatSosmedLink('whatsapp', sosmedItem.whatsapp);
  const igLink = formatSosmedLink('instagram', sosmedItem.instagram);
  const tiktokLink = formatSosmedLink('tiktok', sosmedItem.tiktok);
  const threadsLink = formatSosmedLink('threads', sosmedItem.threads);

  const hasSosmed = Boolean(waLink || igLink || tiktokLink || threadsLink);
  const isPngPhoto = panitia.foto_panitia?.toLowerCase().includes('.png');

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full h-[100dvh] sm:h-auto max-w-2xl bg-white dark:bg-zinc-950 sm:border border-zinc-200 dark:border-zinc-800 rounded-none sm:rounded-3xl p-4 sm:p-7 sm:space-y-6 shadow-2xl overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Image di Modal jika ada (~60% transparansi) */}
        {panitia.bg_image && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-60"
            style={{ backgroundImage: `url(${panitia.bg_image})` }}
          />
        )}
        {panitia.bg_image && (
          <div className="absolute inset-0 z-0 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xs pointer-events-none" />
        )}

        {/* Header Modal Fullscreen Tanpa Nomor Urut */}
        <div className="relative z-10 flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[11px] sm:text-xs font-bold text-blue-900 dark:text-blue-300">
              {panitia.jabatan_panitia}
            </span>
            {panitia.sub_jabatan_panitia && (
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {panitia.sub_jabatan_panitia}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            title="Tutup Tampilan"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Konten Diperbesar */}
        <div className="relative z-10 flex-1 overflow-y-auto py-3 sm:py-0 flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
          {/* Foto Diperbesar */}
          <div className="w-36 h-44 sm:w-60 md:w-72 sm:h-auto sm:aspect-4/5 rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md relative flex items-end justify-center shrink-0">
            {panitia.foto_panitia ? (
              <Image
                src={panitia.foto_panitia}
                alt={panitia.nama_panitia}
                fill
                sizes="(max-width: 640px) 150px, 320px"
                className={`object-bottom ${isPngPhoto ? 'object-contain p-1.5' : 'object-cover'
                  }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                <UserCheck className="w-10 h-10 opacity-40 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono">Belum Ada Foto</span>
              </div>
            )}
          </div>

          {/* Rincian Panitia */}
          <div className="flex-1 flex flex-col justify-between space-y-3.5 w-full text-center sm:text-left">
            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Divisi Panitia
                </span>
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                  {panitia.jabatan_panitia}
                </h2>
              </div>

              <div>
                <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Spesifik Divisi Panitia
                </span>
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                  {panitia.sub_jabatan_panitia}
                </h2>
              </div>

              <div>
                <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Nama Panitia
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                  {panitia.nama_panitia}
                </h2>
              </div>

              <div>
                <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Program Studi
                </span>
                <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{panitia.prodi_panitia}</span>
                </p>
              </div>

              {hasSosmed && (
                <div className="pt-1.5 sm:pt-2">
                  <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Tautan Kontak & Sosial Media
                  </span>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sosmedItem?.id && recordTrafikSosmed(sosmedItem.id, 'whatsapp')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition shadow-2xs"
                      >
                        <i className="fa-brands fa-whatsapp text-emerald-600 text-xs sm:text-sm" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {igLink && (
                      <a
                        href={igLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sosmedItem?.id && recordTrafikSosmed(sosmedItem.id, 'instagram')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition shadow-2xs"
                      >
                        <i className="fa-brands fa-instagram text-pink-600 text-xs sm:text-sm" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {tiktokLink && (
                      <a
                        href={tiktokLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sosmedItem?.id && recordTrafikSosmed(sosmedItem.id, 'tiktok')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition shadow-2xs"
                      >
                        <i className="fa-brands fa-tiktok text-xs sm:text-sm" />
                        <span>TikTok</span>
                      </a>
                    )}
                    {threadsLink && (
                      <a
                        href={threadsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sosmedItem?.id && recordTrafikSosmed(sosmedItem.id, 'threads')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition shadow-2xs"
                      >
                        <i className="fa-brands fa-threads text-xs sm:text-sm" />
                        <span>Threads</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Tombol Tutup */}
        <div className="relative z-10 pt-3 sm:pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 sm:py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition shadow-xs cursor-pointer text-center"
          >
            Tutup Tampilan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}