'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getPublikPanduan } from '@/api/publlic/panduan';
import { getYouTubeEmbedUrl } from '@/utils/youtubeUtils';
import { getGoogleDriveEmbedUrl } from '@/utils/driveUtils';
import { getNextMidnightWIBTimestamp } from '@/utils/dateUtils';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedData } from '@/hooks/useTranslatedData';
import TranslatingNotice from '@/components/public/TranslatingNotice';
import {
  BookOpen,
  Menu,
  X,
  Video,
  ChevronRight,
  Hash,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export default function PanduanPortalPage() {
  const { t } = useTranslation();
  const { data: panduanList, loading, translating } = useTranslatedData('panduan', getPublikPanduan);
  const [activeItemId, setActiveItemId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Set item aktif pertama saat data siap
  useEffect(() => {
    if (panduanList?.[0]?.items?.[0]) {
      setActiveItemId(`item-${panduanList[0].items[0].id}`);
    }
  }, [panduanList]);

  // Scrollspy: pantau section mana yang sedang terlihat di viewport
  useEffect(() => {
    if (loading || panduanList.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveItemId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    const sections = document.querySelectorAll('.panduan-content-section');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, [loading, panduanList]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveItemId(id);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Banner Hero Panduan */}
      <div className="relative pt-8 sm:pt-12 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto space-y-3 px-4 sm:px-6 lg:px-8 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>{t('panduan.badge', 'Pusat Petunjuk Teknis & Regulasi')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            {t('panduan.title', 'Panduan Pemilihan Umum Mahasiswa')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {t('panduan.subtitle', 'Pelajari tata tertib pemilihan, verifikasi DPT, ketentuan pencalonan, serta video tutorial resmi pelaksanaan pemungutan suara BEM Politeknik LP3I.')}
          </p>
        </div>

        {/* BgWaveDivider Dekoratif Panduan Mulus Menuju Konten Bawah */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Mobile Sub-Navbar Hamburger Bar */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-blue-100 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 text-xs font-semibold text-blue-950 dark:text-zinc-200 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4 text-blue-700 dark:text-blue-400" /> : <Menu className="w-4 h-4 text-blue-700 dark:text-blue-400" />}
          <span>{t('pg.pan_menu_list', 'Daftar Menu Panduan')}</span>
        </button>

        <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold truncate max-w-[200px]">
          {t('pg.pan_tech_short', 'Petunjuk Teknis')}
        </span>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[110px] bottom-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl p-5 overflow-y-auto border-b border-blue-100 dark:border-zinc-800 animate-in slide-in-from-top-4">
          <div className="space-y-6">
            {panduanList.map((p) => (
              <div key={p.id} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 dark:text-zinc-100 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  {p.judul}
                </h4>
                <ul className="space-y-1 pl-2 border-l border-blue-200 dark:border-zinc-800">
                  {(p.items || []).map((sub) => {
                    const sectionId = `item-${sub.id}`;
                    const isActive = activeItemId === sectionId;
                    return (
                      <li key={sub.id}>
                        <button
                          onClick={() => scrollToSection(sectionId)}
                          className={`text-left text-xs py-1.5 px-2.5 rounded-lg w-full transition cursor-pointer ${
                            isActive
                              ? 'bg-blue-700 text-white dark:bg-blue-600 dark:text-white font-bold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-blue-300'
                          }`}
                        >
                          {sub.sub_judul}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex gap-10">
        {/* Desktop Fixed/Sticky Left Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pr-4 pb-10">
          <div className="space-y-6">
            <div className="pb-3 border-b border-blue-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-blue-950 dark:text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                {t('pg.pan_sidebar_title', 'PETUNJUK TEKNIS PEMILU')}
              </span>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mt-1">
                {t('pg.pan_sidebar_sub', 'KPU Mahasiswa LP3I')}
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 bg-blue-50/50 dark:bg-zinc-900/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <nav className="space-y-6">
                {panduanList.map((p) => (
                  <div key={p.id} className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-950 dark:text-zinc-200">
                      {p.judul}
                    </h4>
                    <ul className="space-y-1 pl-2 border-l border-blue-200 dark:border-zinc-800">
                      {(p.items || []).map((sub) => {
                        const sectionId = `item-${sub.id}`;
                        const isActive = activeItemId === sectionId;
                        return (
                          <li key={sub.id}>
                            <button
                              onClick={() => scrollToSection(sectionId)}
                              className={`text-left text-xs py-1.5 px-3 rounded-lg w-full transition-all flex items-center justify-between group cursor-pointer ${
                                isActive
                                  ? 'bg-blue-700 text-white dark:bg-blue-600 dark:text-white font-bold shadow-xs'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-white hover:bg-blue-50/80 dark:hover:bg-zinc-900'
                              }`}
                            >
                              <span className="truncate">{sub.sub_judul}</span>
                              <ChevronRight className={`w-3 h-3 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            )}
          </div>
        </aside>

        {/* Right Main Content */}
        <section className="flex-1 min-w-0 space-y-12 pb-16">
          {loading && translating ? (
            <TranslatingNotice show fullHeight />
          ) : loading ? (
            <div className="space-y-8">
              {[1, 2].map((n) => (
                <div key={n} className="h-64 rounded-3xl bg-blue-50/40 dark:bg-zinc-900/60 border border-blue-100 dark:border-zinc-800 animate-pulse p-6" />
              ))}
            </div>
          ) : panduanList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 max-w-md mx-auto space-y-3 shadow-xs">
              <BookOpen className="w-12 h-12 text-blue-300 dark:text-zinc-600 mx-auto" />
              <h2 className="text-base font-bold text-blue-950 dark:text-zinc-100">{t('pg.pan_empty_title', 'Panduan Sedang Dipersiapkan')}</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {t('pg.pan_empty_desc', 'Materi petunjuk teknis pemilihan akan segera dipublikasikan oleh Panitia KPU.')}
              </p>
            </div>
          ) : (
            panduanList.map((p) => (
              <div key={p.id} className="space-y-8">
                {/* Judul Kategori Panduan */}
                <div className="pb-3 border-b border-blue-100 dark:border-zinc-800">
                  <h2 className="text-xl sm:text-2xl font-black text-blue-950 dark:text-zinc-100 flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">#</span>
                    {p.judul}
                  </h2>
                </div>

                {/* Sub Panduan Items */}
                <div className="space-y-8">
                  {(p.items || []).map((sub) => {
                    const sectionId = `item-${sub.id}`;
                    const youtubeEmbed = getYouTubeEmbedUrl(sub.link_vidio);
                    const driveEmbed = !youtubeEmbed ? getGoogleDriveEmbedUrl(sub.link_vidio) : null;
                    const hasVideo = youtubeEmbed || driveEmbed;

                    return (
                      <article
                        key={sub.id}
                        id={sectionId}
                        className="panduan-content-section scroll-mt-24 rounded-3xl bg-white/95 dark:bg-zinc-950/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 p-6 sm:p-8 space-y-6 shadow-xs transition-all"
                      >
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-[11px] font-mono">
                            <Hash className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                            <span>{t('pg.pan_material', 'Materi Panduan')}</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-blue-950 dark:text-zinc-100">
                            {sub.sub_judul}
                          </h3>
                        </div>

                        {/* Iframe Video Berbingkai */}
                        {hasVideo && (
                          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-black shadow-lg p-2 sm:p-3">
                            <div className="flex items-center justify-between pb-2 px-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                              <span className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                                <Video className="w-3.5 h-3.5 text-zinc-500" />
                                {t('pg.pan_video', 'Video Panduan Edukasi')}
                              </span>
                              {sub.link_vidio && (
                                <a
                                  href={sub.link_vidio}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline flex items-center gap-1 transition text-zinc-700 dark:text-zinc-300"
                                >
                                  <span>{t('pg.pan_open_source', 'Buka Sumber')}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                              <iframe
                                src={youtubeEmbed || driveEmbed}
                                title={sub.sub_judul}
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}

                        {/* Teks Isi Panduan */}
                        <div className="prose dark:prose-invert prose-zinc prose-sm sm:prose-base max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3">
                          <ReactMarkdown>{sub.isi}</ReactMarkdown>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
