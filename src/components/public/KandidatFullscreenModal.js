'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Compass,
  Target,
  ExternalLink,
} from 'lucide-react';

export default function KandidatFullscreenModal({ kandidat, onClose }) {
  // Cegah scroll pada body saat modal terbuka
  useEffect(() => {
    if (!kandidat) return;
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
  }, [kandidat, onClose]);

  if (!kandidat) return null;

  const detail = kandidat.detail_kandidat || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl z-10 transition-colors">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-bold">
              {kandidat.posisi || 'Calon Pemimpin'}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terverifikasi KPU</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
            aria-label="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Section: Foto & Biodata Ringkas */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-zinc-200 dark:border-zinc-800">
            {/* Foto Kandidat */}
            <div className="relative w-44 sm:w-52 aspect-4/5 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md shrink-0">
              {kandidat.fotodiri_kandidat ? (
                <Image
                  src={kandidat.fotodiri_kandidat}
                  alt={kandidat.nama_kandidat}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 176px, 208px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                  <UserCheck className="w-16 h-16 opacity-50 mb-2" />
                  <span className="text-xs font-mono">Foto Belum Tersedia</span>
                </div>
              )}
            </div>

            {/* Identitas Kandidat */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {kandidat.nama_kandidat}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono text-zinc-500 mt-1">
                  <span>NIM: <strong className="text-zinc-800 dark:text-zinc-200">{kandidat.nim_kandidat}</strong></span>
                  <span>•</span>
                  <span>Angkatan Mahasiswa Aktif</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Program Studi: <strong>{kandidat.prodi_kandidat}</strong></span>
              </div>

              {/* Kontak & Berkas */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                {detail.notlpn_wa_kandidat && (
                  <a
                    href={`https://wa.me/${detail.notlpn_wa_kandidat.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold hover:opacity-90 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {detail.emailplb_kandidat && (
                  <a
                    href={`mailto:${detail.emailplb_kandidat}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:opacity-90 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{detail.emailplb_kandidat}</span>
                  </a>
                )}

                {detail.cv_portofolio_kandidat && (
                  <a
                    href={detail.cv_portofolio_kandidat}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold shadow-xs hover:opacity-90 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Unduh Berkas / CV</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Visi & Misi */}
          <div className="space-y-6">
            {/* Visi */}
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3>Visi Calon</h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                {detail.visi ? `"${detail.visi}"` : 'Visi belum dicantumkan oleh kandidat.'}
              </p>
            </div>

            {/* Misi */}
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3>Misi & Program Pokok</h3>
              </div>
              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {detail.misi || 'Misi kepemimpinan sedang dalam proses penyusunan final.'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
          <span>Komisi Pemilihan Umum Mahasiswa LP3I</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
