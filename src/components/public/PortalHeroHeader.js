'use client';

import { ShieldCheck, Vote, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const ICONS = { panitia: ShieldCheck, paslon: Vote, kandidat: Users };

const FALLBACKS = {
  panitia: {
    badge: 'Penyelenggara Pemilu Raya Mahasiswa',
    title: 'Susunan Panitia KPU Mahasiswa',
    subtitle:
      'Mengenal jajaran panitia independen yang bertugas merencanakan, melaksanakan, dan mengawal seluruh tahapan Pemilihan Umum Mahasiswa Politeknik LP3I.',
  },
  paslon: {
    badge: 'Kontestasi Pemilu Raya Mahasiswa',
    title: 'Pasangan Calon Resmi',
    subtitle:
      'Geser kartu untuk meninjau gagasan kepemimpinan, profil lengkap Capres & Cawapres, serta visi misi masing-masing pasangan calon.',
  },
  kandidat: {
    badge: 'Peserta Pemilu Raya Mahasiswa',
    title: 'Calon Pemimpin Mahasiswa',
    subtitle:
      'Mengenal profil, visi, dan misi kandidat calon pemimpin Badan Eksekutif Mahasiswa (BEM) Politeknik LP3I yang telah lolos tahapan verifikasi seleksi KPU.',
  },
};

export default function PortalHeroHeader({ section }) {
  const { t } = useTranslation();
  const Icon = ICONS[section] || ShieldCheck;
  const fb = FALLBACKS[section] || FALLBACKS.panitia;

  return (
    <div className="max-w-7xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
        <Icon className="w-4 h-4 text-blue-700 dark:text-blue-400" />
        <span>{t(`${section}.badge`, fb.badge)}</span>
      </div>

      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
        {t(`${section}.title`, fb.title)}
      </h1>

      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        {t(`${section}.subtitle`, fb.subtitle)}
      </p>
    </div>
  );
}
