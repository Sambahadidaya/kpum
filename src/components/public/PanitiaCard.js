'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UserCheck,
  GraduationCap,
  Briefcase,
  Maximize2,
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

export default function PanitiaCard({ panitia, onEnlarge }) {
  const cardRef = useRef(null);
  const defaultRotateX = 1.5;
  const defaultRotateY = -2.5;

  const [rotX, setRotX] = useState(defaultRotateX);
  const [rotY, setRotY] = useState(defaultRotateY);
  const [isHovered, setIsHovered] = useState(false);

  // Ambil data sosmed
  const sosmedItem = Array.isArray(panitia.sosmed_panitia) && panitia.sosmed_panitia.length > 0
    ? panitia.sosmed_panitia[0]
    : (panitia.sosmed_panitia || {});

  const waLink = formatSosmedLink('whatsapp', sosmedItem.whatsapp);
  const igLink = formatSosmedLink('instagram', sosmedItem.instagram);
  const tiktokLink = formatSosmedLink('tiktok', sosmedItem.tiktok);
  const threadsLink = formatSosmedLink('threads', sosmedItem.threads);

  const hasSosmed = Boolean(waLink || igLink || tiktokLink || threadsLink);
  const isPngPhoto = panitia.foto_panitia?.toLowerCase().includes('.png');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const calcY = ((x - centerX) / centerX) * 4; // Max 4 deg
    const calcX = -((y - centerY) / centerY) * 4;

    setRotX(calcX);
    setRotY(calcY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(defaultRotateX);
    setRotY(defaultRotateY);
  };

  return (
    <div
      className="w-[calc(100vw-2.5rem)] sm:w-[calc(100vw-3.5rem)] md:w-[calc((100%-1.5rem)/2)] shrink-0 snap-start"
      style={{ perspective: '1200px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) ${isHovered ? 'translateY(-4px) scale(1.008)' : 'translateY(0)'
            }`,
          transition: isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="group relative rounded-3xl bg-white/95 dark:bg-zinc-950/95 border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_12px_28px_-10px_rgba(30,58,138,0.1)] dark:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(30,58,138,0.18)] dark:hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.95)] flex flex-col justify-between"
      >
        {/* Background Image Opsional Transparansi ~60% */}
        {panitia.bg_image && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none dark:opacity-100 opacity-100 transition-opacity duration-300"
            style={{ backgroundImage: `url(${panitia.bg_image})` }}
          />
        )}

        {/* Lapisan Tint Netral untuk Keterbacaan Teks Maksimal */}
        {panitia.bg_image && (
          <div className="absolute inset-0 z-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-[2px] pointer-events-none" />
        )}

        {/* Soft Lighting Glare */}
        <div
          className="absolute inset-0 z-0 pointer-events-none rounded-3xl opacity-30 dark:opacity-20 transition-opacity duration-300 group-hover:opacity-50"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.12), transparent 60%)',
          }}
        />

        {/* KONTEN KARTU PANITIA */}
        <div className="relative z-10 flex flex-row items-stretch justify-between p-4 sm:p-5 md:p-6 gap-3.5 sm:gap-5 min-h-[200px] sm:min-h-[220px]">
          {/* Bagian Kiri: Informasi Panitia & Aksi */}
          <div className="flex-1 flex flex-col justify-between space-y-2.5 min-w-0">
            {/* Jabatan & Sub-Jabatan */}
            <div className="space-y-2">
              {/* <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-300 text-[10px] sm:text-xs font-bold tracking-wide shadow-2xs">
                  <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {panitia.jabatan_panitia}
                  </span>
                </span>

                {panitia.sub_jabatan_panitia && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 text-[10px] sm:text-xs font-semibold shadow-2xs">
                    {panitia.sub_jabatan_panitia}
                  </span>
                )}
              </div> */}

              {/* Jabatan Panitia */}
              <h3 className="inline-flex items-center gap-2 text-base -mb-1 sm:text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-500 tracking-tight leading-snug group-hover:text-gray-900 dark:group-hover:text-zinc-100 transition-colors line-clamp-2">
                <Briefcase className="w-3 h-3 text-zinc-900 dark:text-zinc-500 hover:text-zinc-400 dark:hover:text-zinc-400 shrink-0" />Jabatan :  {panitia.jabatan_panitia}
              </h3>
              {/* sub_Jabatan Panitia */}
              <h4 className="text-base sm:text-lg md:text-md mb-8 font-bold text-zinc-900 dark:text-zinc-500 tracking-tight leading-snug group-hover:text-gray-900 dark:group-hover:text-zinc-100 transition-colors line-clamp-2">
                {panitia.sub_jabatan_panitia}
              </h4>

              {/* Nama Panitia */}
              <h5 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-500 tracking-tight leading-snug group-hover:text-gray-900 dark:group-hover:text-zinc-100 transition-colors line-clamp-2">
                Nama : {panitia.nama_panitia}
              </h5>

              {/* Ikon Sosial Media Tepat di Bawah Nama Panitia */}
              {hasSosmed && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sosmedItem?.id && recordTrafikSosmed(sosmedItem.id, 'whatsapp')}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 border border-zinc-200/90 dark:border-zinc-700/80 flex items-center justify-center transition active:scale-95 shadow-2xs"
                      title="Hubungi via WhatsApp"
                    >
                      <i className="fa-brands fa-whatsapp text-xs sm:text-sm" />
                    </a>
                  )}
                  {igLink && (
                    <a
                      href={igLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sosmedItem?.id && recordTrafikSosmed(sosmedItem.id, 'instagram')}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-700 hover:text-pink-600 dark:text-zinc-300 dark:hover:text-pink-400 border border-zinc-200/90 dark:border-zinc-700/80 flex items-center justify-center transition active:scale-95 shadow-2xs"
                      title="Kunjungi Instagram"
                    >
                      <i className="fa-brands fa-instagram text-xs sm:text-sm" />
                    </a>
                  )}
                  {tiktokLink && (
                    <a
                      href={tiktokLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sosmedItem?.id && recordTrafikSosmed(sosmedItem.id, 'tiktok')}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border border-zinc-200/90 dark:border-zinc-700/80 flex items-center justify-center transition active:scale-95 shadow-2xs"
                      title="Kunjungi TikTok"
                    >
                      <i className="fa-brands fa-tiktok text-xs sm:text-sm" />
                    </a>
                  )}
                  {threadsLink && (
                    <a
                      href={threadsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sosmedItem?.id && recordTrafikSosmed(sosmedItem.id, 'threads')}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border border-zinc-200/90 dark:border-zinc-700/80 flex items-center justify-center transition active:scale-95 shadow-2xs"
                      title="Kunjungi Threads"
                    >
                      <i className="fa-brands fa-threads text-xs sm:text-sm" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Prodi & Tombol Perbesar */}
            <div className="pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {panitia.prodi_panitia}
                </span>
              </div>

              {/* Tombol Perbesar Card */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEnlarge) onEnlarge(panitia);
                }}
                className="relative z-20 inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] sm:text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition active:scale-95 cursor-pointer shadow-2xs"
                title="Perbesar tampilan kartu"
              >
                <Maximize2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                <span>Perbesar</span>
              </button>
            </div>
          </div>

          {/* Bagian Kanan: Foto Panitia */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative w-28 sm:w-36 md:w-44 lg:w-48 aspect-4/5 rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-100/80 to-zinc-200/60 dark:from-zinc-900/80 dark:to-zinc-950/80 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs flex items-end justify-center">
              {panitia.foto_panitia ? (
                <Image
                  src={panitia.foto_panitia}
                  alt={panitia.nama_panitia}
                  fill
                  sizes="(max-width: 768px) 160px, 220px"
                  className={`transition-transform duration-500 group-hover:scale-105 ${isPngPhoto
                    ? 'object-contain object-bottom p-1.5'
                    : 'object-cover object-top'
                    }`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 p-2 text-center">
                  <UserCheck className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[9px] font-mono text-zinc-400">Foto Panitia</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}