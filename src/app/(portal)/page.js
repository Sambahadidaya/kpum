'use client';

import Link from 'next/link';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import TombolPublik from '@/components/public/tombol';
import TimelineSection from '@/components/public/TimelineSection';
import HeroTimelineProgress from '@/components/public/HeroTimelineProgress';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Users,
  BookOpen,
  FolderKanban,
  Vote,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function BerandaPortalPage() {
  const { t } = useTranslation();

  return (
    <div className="relative w-full flex flex-col transition-colors md:-mt-8 bg-dot-matrix">
      {/* =====================================================================
          SECTION 1: HERO SECTION
         ===================================================================== */}
      <section className="relative flex flex-col justify-between pt-12 sm:pt-20 lg:pt-24 pb-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] text-zinc-900 dark:text-zinc-100">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12">
          {/* Kolom Kiri: Teks Informasi Utama */}
          <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
              <span>{t('hero.badge', 'Portal Resmi KPU Mahasiswa Politeknik LP3I')}</span>
            </div>

            <h1 className="text-center sm:text-left text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              {t('hero.title_part1', 'Suara Mahasiswa,')} <br />
              <span className="text-blue-700 dark:text-blue-400">
                {t('hero.title_part2', 'Masa Depan BEM LP3I')}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed">
              {t(
                'hero.desc',
                'Selamat datang di portal informasi resmi Pemilihan Umum Raya Presiden dan Wakil Presiden Mahasiswa Politeknik LP3I. Kenali calon pemimpin, pelajari tata cara pemilihan, dan gunakan hak suara Anda secara bijak.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 justify-center sm:justify-start">
              <TombolPublik
                href="/kandidat"
                variant="primary"
                size="lg"
                icon={Users}
              >
                {t('hero.btn_kandidat', 'Lihat Calon Kandidat')}
              </TombolPublik>

              <TombolPublik
                href="/panduan"
                variant="secondary"
                size="lg"
                icon={BookOpen}
              >
                {t('hero.btn_panduan', 'Tata Cara Memilih')}
              </TombolPublik>
            </div>

            {/* Quick Badges Asas Pemilu */}
            <div className="pt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 justify-center sm:justify-start">
              <span className="font-bold text-blue-950 dark:text-blue-300">
                {t('hero.asas_title', 'Asas Pemilu:')}
              </span>
              <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium md:text-sm">
                {t('hero.asas_langsung', 'Langsung')}
              </span>
              <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium md:text-sm">
                {t('hero.asas_bebas', 'Bebas')}
              </span>
              <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium md:text-sm">
                {t('hero.asas_rahasia', 'Rahasia')}
              </span>
              <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium md:text-sm">
                {t('hero.asas_jujur_adil', 'Jujur & Adil')}
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Visual 3D Interactive Ballot Box */}
          <div className="lg:col-span-5 flex justify-center perspective-card-container py-6">
            <div className="ballot-box-3d w-full max-w-md rounded-3xl p-[2px] relative cursor-pointer group">
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white dark:bg-zinc-950 border border-blue-200/80 dark:border-blue-900/60 group-hover:border-transparent transition-colors duration-300">
                {/* 1. Animasi Border Muter */}
                <div className="pointer-events-none absolute -inset-[120%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-spin bg-[conic-gradient(from_0deg,transparent_0_250deg,#2563eb_300deg,#60a5fa_335deg,#93c5fd_360deg)] z-0" />

                {/* 2. Inner Card Content */}
                <div className="relative z-10 m-[1.5px] rounded-[22px] bg-white dark:bg-zinc-950 p-6 sm:p-7 overflow-hidden">
                  {/* Header Card */}
                  <div className="relative z-10 flex items-center justify-between pb-5 border-b border-blue-100 dark:border-zinc-800 layer-float-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 dark:bg-blue-600 text-white shadow-xs flex items-center justify-center font-black">
                        <Vote className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-blue-950 dark:text-zinc-100 font-extrabold text-sm tracking-wide">
                          {t('hero.ballot_title', 'SURAT SUARA DIGITAL')}
                        </h3>
                        <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                          {t('hero.ballot_sub', 'Pemilu Raya Presma BEM')}
                        </p>
                      </div>
                    </div>
                    <p className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[12px] font-bold uppercase tracking-wider">
                      {t('hero.ballot_badge', 'TAHAPAN AKTIF')}
                    </p>
                  </div>

                  {/* Status Pemilihan */}
                  <div className="relative z-10 py-5 space-y-4 layer-float-md">
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-zinc-900/90 border border-blue-100 dark:border-zinc-800 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t('hero.cat_label', 'Kategori:')}
                        </span>
                        <span className="text-blue-950 dark:text-zinc-100 font-semibold">
                          {t('hero.cat_val', 'Presiden & Wapresma Mahasiswa')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t('hero.loc_label', 'Tempat:')}
                        </span>
                        <span className="text-blue-950 dark:text-zinc-100 font-semibold">
                          {t('hero.loc_val', 'Kampus Politeknik LP3I')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t('hero.org_label', 'Penyelenggara:')}
                        </span>
                        <span className="text-blue-700 dark:text-blue-400 font-bold">
                          {t('hero.org_val', 'Panitia KPUM 2025/2026')}
                        </span>
                      </div>
                    </div>

                    <HeroTimelineProgress />

                    <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                        <span className="text-xs text-blue-950 dark:text-blue-200 font-semibold">
                          {t('hero.verify_dpt', 'Verifikasi DPT Mahasiswa')}
                        </span>
                      </div>
                      <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-700">
                        {t('hero.one_vote', '1 Suara Sah')}
                      </span>
                    </div>
                  </div>

                  {/* Action Link in 3D Card */}
                  <div className="relative z-10 pt-2 border-t border-blue-100 dark:border-zinc-800 layer-float-sm">
                    <Link
                      href="/panduan"
                      className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-blue-50/60 dark:bg-zinc-900 hover:bg-blue-700 hover:text-white dark:hover:bg-blue-600 text-blue-950 dark:text-zinc-200 text-xs font-bold border border-blue-200/80 dark:border-zinc-800 transition-all group/btn shadow-xs"
                    >
                      <span>{t('hero.check_terms', 'Cek Syarat & Ketentuan Memilih')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sambungan Gelombang Menuju Section 2 */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-blue-50/80 dark:text-[#0b0f19]/85" />
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: TIMELINE KEGIATAN KPU
         ===================================================================== */}
      <TimelineSection />

      {/* =====================================================================
          SECTION 3: TAHAPAN PEMILIHAN UMUM MAHASISWA
         ===================================================================== */}
      <section className="relative flex flex-col justify-between pt-16 sm:pt-24 pb-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] text-zinc-900 dark:text-zinc-100 transition-colors">
        <div className="max-w-7xl mx-auto w-full my-auto space-y-12 px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-800 dark:text-blue-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>{t('timeline.badge', 'Agenda & Tahapan')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
              {t('timeline.title', 'Tahapan Pemilihan Umum Mahasiswa')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {t(
                'timeline.desc',
                'Seluruh rangkaian kegiatan dilaksanakan secara transparan, terstruktur, dan akuntabel demi suksesi kepemimpinan BEM LP3I yang demokratis.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 space-y-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="text-base font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {t('timeline.step1_title', 'Sosialisasi & Pendaftaran')}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t(
                  'timeline.step1_desc',
                  'Pengumuman syarat pencalonan, pendaftaran berkas pasangan calon presiden dan wakil presiden mahasiswa.'
                )}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 space-y-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="text-base font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {t('timeline.step2_title', 'Verifikasi & Pengundian')}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t(
                  'timeline.step2_desc',
                  'Pemeriksaan keabsahan berkas administrasi dan rapat pleno pengundian nomor urut pasangan calon.'
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 space-y-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="text-base font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {t('timeline.step3_title', 'Kampanye & Debat Terbuka')}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t(
                  'timeline.step3_desc',
                  'Penyampaian visi-misi, orasi gagasan, serta debat terbuka kandidat di hadapan seluruh civitas akademika LP3I.'
                )}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 space-y-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                04
              </div>
              <h3 className="text-base font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {t('timeline.step4_title', 'Pemungutan & Perhitungan')}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t(
                  'timeline.step4_desc',
                  'Pemberian hak suara di bilik TPS secara langsung dan penghitungan suara terbuka oleh panitia KPU.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Sambungan Gelombang Menuju Section 4 */}
        <div className="w-full -mb-px mt-12 sm:mt-16 leading-none">
          <BgWaveDivider className="w-full text-blue-50/80 dark:text-[#0b0f19]/85" />
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: AKSES INFORMASI & DOKUMENTASI
         ===================================================================== */}
      <section className="relative flex flex-col justify-center py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-blue-50/80 dark:bg-[#0b0f19]/85 backdrop-blur-[1px] text-zinc-900 dark:text-zinc-100">
        <div className="max-w-7xl mx-auto w-full my-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
              {t('explore.title', 'Eksplorasi Portal KPU Mahasiswa')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t(
                'explore.desc',
                'Seluruh dokumentasi kegiatan dan panduan lengkap dapat diakses dengan mudah oleh seluruh civitas akademika.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/kandidat"
              className="group p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 space-y-4 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                {t('explore.card1_title', 'Profil Kandidat & Paslon')}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t(
                  'explore.card1_desc',
                  'Lihat daftar nama, latar belakang program studi, dan foto diri para kandidat calon pemimpin BEM.'
                )}
              </p>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pt-2">
                <span>{t('explore.card1_btn', 'Buka Informasi Kandidat')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/dokumentasi"
              className="group p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 space-y-4 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                {t('explore.card2_title', 'Galeri & Dokumentasi')}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t(
                  'explore.card2_desc',
                  'Cuplikan foto dan dokumentasi kegiatan sosialisasi, debat kandidat, hingga arsip Google Drive resmi KPU.'
                )}
              </p>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pt-2">
                <span>{t('explore.card2_btn', 'Lihat Dokumentasi Kegiatan')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/panduan"
              className="group p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 space-y-4 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                {t('explore.card3_title', 'Panduan Pemilihan')}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t(
                  'explore.card3_desc',
                  'Pusat petunjuk teknis, syarat pemilih, tata tertib, serta cuplikan video panduan resmi KPU.'
                )}
              </p>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pt-2">
                <span>{t('explore.card3_btn', 'Baca Panduan Lengkap')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}