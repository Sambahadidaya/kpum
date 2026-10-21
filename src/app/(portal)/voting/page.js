'use client';

import Link from 'next/link';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import { useTranslation } from '@/hooks/useTranslation';
import { Vote, ShieldCheck, CheckCircle2, KeyRound, UserCheck, ArrowRight } from 'lucide-react';

export default function VotingLandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <div className="max-w-4xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100/60 dark:bg-zinc-800/60 border border-blue-200/80 dark:border-blue-900/60 text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
            <Vote className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span>{t('voting.badge', 'Bilik Suara Elektronik Resmi (E-Voting)')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            {t('voting.title', 'Pemungutan Suara Pemilu Mahasiswa')}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {t(
              'voting.subtitle',
              'Salurkan hak pilih Anda secara jujur, adil, rahasia, dan langsung melalui sistem e-voting terintegrasi KPU Mahasiswa Politeknik LP3I.'
            )}
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              href="/voting/login"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
            >
              <span>{t('voting.btn_masuk', 'Masuk ke Bilik Suara')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten 3 Langkah Pemilihan */}
      <div className="flex-1 py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {t('voting.steps_title', '3 Langkah Menggunakan Hak Suara')}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('voting.steps_sub', 'Pastikan Anda telah memiliki Kode Voting resmi dari Panitia KPU Mahasiswa.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Langkah 1 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-black text-sm">
              01
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t('voting.step1_title', 'Verifikasi Kode Voting')}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t(
                'voting.step1_desc',
                'Masukkan NIM dan Kode Voting unik 6 karakter yang telah dibagikan oleh panitia KPU.'
              )}
            </p>
          </div>

          {/* Langkah 2 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-black text-sm">
              02
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t('voting.step2_title', 'Tentukan Pilihan Anda')}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t(
                'voting.step2_desc',
                'Pilih pasangan calon sesuai hati nurani pada surat suara digital di bilik suara rahasia.'
              )}
            </p>
          </div>

          {/* Langkah 3 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-black text-sm">
              03
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t('voting.step3_title', 'Konfirmasi & Bukti Suara')}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t(
                'voting.step3_desc',
                'Konfirmasi pilihan Anda hingga muncul tanda bukti pencoblosan berhasil terekam sistem.'
              )}
            </p>
          </div>
        </div>

        {/* Informasi Keamanan */}
        <div className="p-5 sm:p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {t('pg.vote_secure_title', 'Kerahasiaan dan Keamanan Terjamin')}
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                {t('pg.vote_secure_desc', 'Setiap pemilih hanya memiliki 1 kali kesempatan voting dan sistem mencatat suara secara terenkripsi.')}
              </p>
            </div>
          </div>

          <Link
            href="/voting/login"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer"
          >
            {t('pg.vote_start_now', 'Mulai Sekarang')}
          </Link>
        </div>
      </div>
    </div>
  );
}
