'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Vote,
  UserCheck,
  FolderKanban,
  BookOpen,
  Mail,
  ChevronRight,
  ChevronDown,
  Info,
  X,
  FlaskConical,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageDropdown from '@/components/public/LanguageDropdown';
import { useTranslation } from '@/hooks/useTranslation';
import logoKpu from '@/aseets/logo.png';

export const NAV_LINKS = [
  { name: 'Beranda', href: '/', icon: Home, key: 'nav.beranda' },
  { name: 'Kandidat', href: '/kandidat', icon: Users, key: 'nav.kandidat' },
  { name: 'Paslon', href: '/paslon', icon: Vote, key: 'nav.paslon' },
  { name: 'E-Voting', href: '/voting', icon: Vote, key: 'nav.voting' },
  { name: 'Simulasi', href: '/simulasi', icon: FlaskConical, key: 'nav.simulasi' },
  { name: 'Panitia', href: '/struktur-panitia', icon: UserCheck, key: 'nav.panitia' },
  { name: 'Dokumentasi', href: '/dokumentasi', icon: FolderKanban, key: 'nav.dokumentasi' },
  { name: 'Panduan', href: '/panduan', icon: BookOpen, key: 'nav.panduan' },
  { name: 'Kontak', href: '/contact', icon: Mail, key: 'nav.kontak' },
];

// 5 Menu Utama Struktur UL - LI untuk Desktop & Mobile
export const PORTAL_NAV_STRUCTURE = [
  {
    id: 'beranda',
    name: 'Beranda',
    key: 'nav.beranda',
    href: '/',
    icon: Home,
    isDropdown: false,
  },
  {
    id: 'kandidat',
    name: 'Kandidat',
    key: 'nav.kandidat',
    icon: Users,
    isDropdown: true,
    subItems: [
      {
        name: 'Daftar Kandidat',
        key: 'nav.daftar_kandidat',
        href: '/kandidat',
        icon: Users,
        descKey: 'nav.desc_kandidat',
        desc: 'Profil lengkap calon presma',
      },
      {
        name: 'Pasangan Calon (Paslon)',
        key: 'nav.pasangan_calon',
        href: '/paslon',
        icon: Vote,
        descKey: 'nav.desc_paslon',
        desc: 'Daftar pasangan calon resmi',
      },
    ],
  },
  {
    id: 'voting',
    name: 'Voting',
    key: 'nav.voting',
    icon: Vote,
    isDropdown: true,
    subItems: [
      {
        name: 'E-Voting Resmi',
        key: 'nav.evoting_resmi',
        href: '/voting',
        icon: Vote,
        descKey: 'nav.desc_evoting',
        desc: 'Bilik suara resmi dengan kode voting',
      },
      {
        name: 'Simulasi Voting',
        key: 'nav.simulasi_voting',
        href: '/simulasi',
        icon: FlaskConical,
        descKey: 'nav.desc_simulasi',
        desc: 'Coba voting tanpa data tersimpan',
      },
    ],
  },
  {
    id: 'panitia',
    name: 'Panitia',
    key: 'nav.panitia',
    href: '/struktur-panitia',
    icon: UserCheck,
    isDropdown: false,
  },
  {
    id: 'informasi',
    name: 'Informasi',
    key: 'nav.informasi',
    icon: Info,
    isDropdown: true,
    subItems: [
      {
        name: 'Dokumentasi',
        key: 'nav.dokumentasi',
        href: '/dokumentasi',
        icon: FolderKanban,
        descKey: 'nav.desc_dokumentasi',
        desc: 'Galeri foto dan video arsip kegiatan',
      },
      {
        name: 'Panduan Pemilu',
        key: 'nav.panduan',
        href: '/panduan',
        icon: BookOpen,
        descKey: 'nav.desc_panduan',
        desc: 'Tata cara dan tahapan pemilihan',
      },
      {
        name: 'Kontak & Bantuan',
        key: 'nav.kontak',
        href: '/contact',
        icon: Mail,
        descKey: 'nav.desc_kontak',
        desc: 'Kirim pesan dan pengaduan KPU',
      },
    ],
  },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // State dropdown mobile & desktop
  const [mobileOpenDropdownId, setMobileOpenDropdownId] = useState(null);
  const [desktopOpenDropdownId, setDesktopOpenDropdownId] = useState(null);
  const desktopNavRef = useRef(null);

  // Tutup dropdown saat pindah halaman
  useEffect(() => {
    setMobileOpenDropdownId(null);
    setDesktopOpenDropdownId(null);
  }, [pathname]);

  // Click outside untuk desktop dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (desktopNavRef.current && !desktopNavRef.current.contains(event.target)) {
        setDesktopOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cek apakah suatu menu aktif berdasarkan URL
  const isMenuGroupActive = (item) => {
    if (!item.isDropdown) {
      return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
    }
    return item.subItems.some((sub) => pathname.startsWith(sub.href));
  };

  // Cari index menu mobile yang aktif
  const getActiveMobileIndex = () => {
    if (pathname === '/') return 0;
    if (pathname.startsWith('/kandidat') || pathname.startsWith('/paslon')) return 1;
    if (pathname.startsWith('/voting') || pathname.startsWith('/simulasi')) return 2;
    if (pathname.startsWith('/struktur-panitia')) return 3;
    if (
      pathname.startsWith('/panduan') ||
      pathname.startsWith('/contact') ||
      pathname.startsWith('/dokumentasi')
    ) {
      return 4;
    }
    return 0;
  };

  const activeMobileIndex = getActiveMobileIndex();
  const activeMobileItem =
    PORTAL_NAV_STRUCTURE[
      mobileOpenDropdownId !== null
        ? PORTAL_NAV_STRUCTURE.findIndex((item) => item.id === mobileOpenDropdownId)
        : -1
    ];

  return (
    <>
      {/* Top Navbar Header (Desktop & Header Mobile) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-black/90 border-b border-blue-100 dark:border-zinc-800 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src={logoKpu}
                alt="Logo KPU LP3I"
                width={40}
                height={40}
                priority
                className="object-cover w-full h-full scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                {t('header.brand_title', 'KPU MAHASISWA')}
              </span>
              <span className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-semibold">
                {t('header.brand_sub', 'Politeknik LP3I')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation: Berupa Dropdown UL-LI di Atas seperti Mobile */}
          <nav ref={desktopNavRef} className="hidden md:flex items-center gap-1.5 relative">
            {PORTAL_NAV_STRUCTURE.map((item) => {
              const Icon = item.icon;
              const displayName = t(item.key, item.name);
              const isGroupActive = isMenuGroupActive(item);
              const isDropdownOpen = desktopOpenDropdownId === item.id;

              // Jika bukan dropdown (Beranda, Panitia)
              if (!item.isDropdown) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isGroupActive
                        ? 'bg-blue-700 text-white shadow-xs dark:bg-blue-600 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{displayName}</span>
                  </Link>
                );
              }

              // Jika Dropdown (Kandidat, Voting, Informasi)
              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setDesktopOpenDropdownId(isDropdownOpen ? null : item.id)
                    }
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                      isGroupActive || isDropdownOpen
                        ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-zinc-900'
                    }`}
                    aria-expanded={isDropdownOpen}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{displayName}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-zinc-400'
                      }`}
                    />
                  </button>

                  {/* Popover UL-LI Desktop Dropdown Mengambang di Atas (Tepat di Bawah Navbar) */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-blue-100 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          {t('header.menu_prefix', 'Menu')} {displayName}
                        </span>
                      </div>

                      <ul className="space-y-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname.startsWith(sub.href);
                          const SubIcon = sub.icon;
                          const subName = t(sub.key, sub.name);
                          const subDesc = t(sub.descKey, sub.desc);

                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                onClick={() => setDesktopOpenDropdownId(null)}
                                className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                                  isSubActive
                                    ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300'
                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                      isSubActive
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                                    }`}
                                  >
                                    <SubIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold leading-tight">
                                      {subName}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                      {subDesc}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight
                                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                                    isSubActive
                                      ? 'text-blue-600 dark:text-blue-400 translate-x-0.5'
                                      : 'text-zinc-400'
                                  }`}
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Action Tools: LanguageDropdown (Hanya Emote Bendera) + ThemeToggle */}
          <div className="flex items-center gap-2">
            <LanguageDropdown />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Backdrop penutup saat sub-menu dropdown aktif di mobile */}
      {mobileOpenDropdownId && (
        <div
          onClick={() => setMobileOpenDropdownId(null)}
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Popover Sub-Menu UL-LI Mengambang di atas Navbar Mobile */}
      {activeMobileItem && activeMobileItem.isDropdown && (
        <div className="md:hidden fixed bottom-20 left-3 right-3 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-blue-200/90 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 space-y-2">
            {/* Header Dropdown Mobile */}
            <div className="flex items-center justify-between px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <activeMobileItem.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {t('header.menu_prefix', 'Menu')} {t(activeMobileItem.key, activeMobileItem.name)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpenDropdownId(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List UL - LI Menu Mobile */}
            <ul className="space-y-1.5 pt-1">
              {activeMobileItem.subItems.map((sub) => {
                const isSubActive = pathname.startsWith(sub.href);
                const SubIcon = sub.icon;
                return (
                  <li key={sub.href}>
                    <Link
                      href={sub.href}
                      onClick={() => setMobileOpenDropdownId(null)}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        isSubActive
                          ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSubActive
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold leading-tight">
                            {t(sub.key, sub.name)}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                            {t(sub.descKey, sub.desc)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSubActive
                            ? 'text-blue-600 dark:text-blue-400 translate-x-0.5'
                            : 'text-zinc-400'
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (5 Menu dengan Efek 3D Bulat Menembus) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t border-blue-200/80 dark:border-zinc-800 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_25px_rgba(0,0,0,0.5)] safe-area-bottom overflow-visible">
        <div className="relative grid grid-cols-5 w-full h-16 overflow-visible">
          {activeMobileIndex >= 0 && (
            <div
              className="absolute top-0 bottom-0 left-0 w-1/5 pointer-events-none transition-transform duration-300 ease-out z-20 flex items-center justify-center"
              style={{
                transform: `translateX(${activeMobileIndex * 100}%)`,
              }}
            >
              <div className="relative -top-4 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-black border-[3px] border-blue-200/90 dark:border-zinc-800 shadow-[0_-6px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_-6px_22px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-300">
                  <div className="w-11 h-11 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 shadow-inner" />
                </div>
              </div>
            </div>
          )}

          {PORTAL_NAV_STRUCTURE.map((item, idx) => {
            const isActive = idx === activeMobileIndex;
            const Icon = item.icon;
            const itemName = t(item.key, item.name);

            const handleClick = (e) => {
              if (item.isDropdown) {
                e.preventDefault();
                setMobileOpenDropdownId((prev) => (prev === item.id ? null : item.id));
              }
            };

            const content = isActive ? (
              <div className="relative flex flex-col items-center justify-center w-full h-full">
                <div className="w-14 h-14 flex items-center justify-center -translate-y-4 transition-transform duration-300">
                  <Icon className="w-6.5 h-6.5 text-blue-600 dark:text-blue-400 drop-shadow-xs" />
                </div>
                <span className="absolute bottom-1.5 text-[9.5px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap tracking-tight transition-all duration-300">
                  {itemName}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 w-full h-full">
                <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                <span className="text-[9.5px] font-medium whitespace-nowrap leading-none transition-all duration-300">
                  {itemName}
                </span>
              </div>
            );

            if (item.isDropdown) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={handleClick}
                  className="relative z-30 col-span-1 w-full h-full flex flex-col items-center justify-center cursor-pointer focus:outline-hidden"
                  aria-expanded={mobileOpenDropdownId === item.id}
                  aria-label={`Menu ${item.name}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative z-30 col-span-1 w-full h-full flex flex-col items-center justify-center focus:outline-hidden"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
