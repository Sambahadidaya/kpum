'use client';

import Image from 'next/image';
import {
  UserCheck,
  GraduationCap,
  Maximize2,
  CheckCircle2,
  XCircle,
  FileBadge,
} from 'lucide-react';

export default function KandidatCard({ kandidat, onEnlarge }) {
  const detail = kandidat.detail_kandidat || {};
  const isEliminated = Boolean(kandidat.is_eliminated);

  return (
    <div
      onClick={() => onEnlarge && onEnlarge(kandidat)}
      className={`group relative rounded-3xl bg-white/95 dark:bg-zinc-950/95 border transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between cursor-pointer ${
        isEliminated
          ? 'border-zinc-200/80 dark:border-zinc-800/80 opacity-80 hover:opacity-100 hover:border-red-300 dark:hover:border-red-900/60 shadow-xs'
          : 'border-zinc-200/90 dark:border-zinc-800/90 hover:border-blue-400 dark:hover:border-blue-600 shadow-[0_12px_28px_-10px_rgba(30,58,138,0.1)] dark:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.85)] hover:shadow-xl'
      }`}
    >
      {/* Soft Glow Ambient */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none rounded-3xl opacity-20 dark:opacity-10 transition-opacity duration-300 group-hover:opacity-40 ${
          isEliminated
            ? 'bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.15),transparent_60%)]'
            : 'bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_60%)]'
        }`}
      />

      {/* Konten Horizontal Card */}
      <div className="relative z-10 flex flex-row items-stretch justify-between p-4 sm:p-5 md:p-6 gap-3.5 sm:gap-5 min-h-[190px] sm:min-h-[210px]">
        {/* Bagian Kiri: Informasi Calon & Aksi */}
        <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
          <div className="space-y-1.5">
            {/* Posisi Calon */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-300 text-[10px] sm:text-xs font-bold tracking-wide">
                <FileBadge className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-[220px]">
                  {kandidat.posisi || 'Calon Pemimpin'}
                </span>
              </span>
            </div>

            {/* Nama Calon */}
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {kandidat.nama_kandidat}
            </h3>

            {/* NIM & Jurusan */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-zinc-500 font-mono">
              <span>NIM: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{kandidat.nim_kandidat}</strong></span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
              <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-sans truncate">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{kandidat.prodi_kandidat}</span>
              </div>
            </div>

            {/* Kutipan Singkat Visi */}
            {detail.visi && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 italic pt-1 leading-relaxed">
                &ldquo;{detail.visi}&rdquo;
              </p>
            )}
          </div>

          {/* Footer Card: Status Seleksi & Tombol Perbesar */}
          <div className="pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
            {/* Status Lolos / Tereliminasi */}
            {isEliminated ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-[10px] sm:text-xs font-bold">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Tereliminasi</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-[10px] sm:text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Lolos Seleksi</span>
              </span>
            )}

            {/* Tombol Perbesar */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onEnlarge) onEnlarge(kandidat);
              }}
              className="relative z-20 inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] sm:text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Perbesar Profil & Visi Misi"
            >
              <Maximize2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              <span>Perbesar</span>
            </button>
          </div>
        </div>

        {/* Bagian Kanan: Foto Kandidat */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="relative w-28 sm:w-36 md:w-40 aspect-4/5 rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs flex items-end justify-center">
            {kandidat.fotodiri_kandidat ? (
              <Image
                src={kandidat.fotodiri_kandidat}
                alt={kandidat.nama_kandidat || 'Foto Calon'}
                fill
                sizes="(max-width: 768px) 140px, 180px"
                className={`transition-transform duration-500 group-hover:scale-105 object-cover object-top ${
                  isEliminated ? 'grayscale contrast-125' : ''
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 p-2 text-center">
                <UserCheck className="w-8 h-8 opacity-40 mb-1" />
                <span className="text-[9px] font-mono text-zinc-400">Foto Calon</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
