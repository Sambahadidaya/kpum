'use client';

import { useState, useEffect } from 'react';
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
  Info,
  X,
  FlaskConical,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import logoKpu from '@/aseets/logo.png';

export const NAV_LINKS = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Kandidat', href: '/kandidat', icon: Users },
  { name: 'Paslon', href: '/paslon', icon: Vote },
  { name: 'E-Voting', href: '/voting', icon: Vote },
  { name: 'Simulasi', href: '/simulasi', icon: FlaskConical },
  { name: 'Panitia', href: '/struktur-panitia', icon: UserCheck },
  { name: 'Dokumentasi', href: '/dokumentasi', icon: FolderKanban },
  { name: 'Panduan', href: '/panduan', icon: BookOpen },
  { name: 'Kontak', href: '/contact', icon: Mail },
];

// 5 Menu Utama di Mobile dengan Sub-Menu berbasis UL-LI
// Urutan: Beranda -> Kandidat -> Voting (Tengah) -> Panitia -> Informasi
const MOBILE_NAV_ITEMS = [
  {
    id: 'beranda',
    name: 'Beranda',
    href: '/',
    icon: Home,
    isDropdown: false,
  },
  {
    id: 'kandidat',
    name: 'Kandidat',
    icon: Users,
    isDropdown: true,
    subItems: [
      {
        name: 'Daftar Kandidat',
        href: '/kandidat',
        icon: Users,
        desc: 'Profil lengkap calon presma',
      },
      {
        name: 'Pasangan Calon (Paslon)',
        href: '/paslon',
        icon: Vote,
        desc: 'Daftar pasangan calon resmi',
      },
    ],
  },
  {
    id: 'voting',
    name: 'Voting',
    icon: Vote,
    isDropdown: true,
    subItems: [
      {
        name: 'E-Voting Resmi',
        href: '/voting',
        icon: Vote,
        desc: 'Bilik suara resmi dengan kode voting',
      },
      {
        name: 'Simulasi Voting',
        href: '/simulasi',
        icon: FlaskConical,
        desc: 'Coba voting tanpa data tersimpan',
      },
    ],
  },
  {
    id: 'panitia',
    name: 'Panitia',
    href: '/struktur-panitia',
    icon: UserCheck,
    isDropdown: false,
  },
  {
    id: 'informasi',
    name: 'Informasi',
    icon: Info,
    isDropdown: true,
    subItems: [
      {
        name: 'Dokumentasi',
        href: '/dokumentasi',
        icon: FolderKanban,
        desc: 'Galeri foto dan video arsip kegiatan',
      },
      {
        name: 'Panduan Pemilu',
        href: '/panduan',
        icon: BookOpen,
        desc: 'Tata cara dan tahapan pemilihan',
      },
      {
        name: 'Kontak & Bantuan',
        href: '/contact',
        icon: Mail,
        desc: 'Kirim pesan dan pengaduan KPU',
      },
    ],
  },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Tutup dropdown jika berpindah halaman
  useEffect(() => {
    setOpenDropdownId(null);
  }, [pathname]);

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
    )
      return 4;
    return 0;
  };

  const activeMobileIndex = getActiveMobileIndex();
  const activeItem = MOBILE_NAV_ITEMS[openDropdownId !== null
    ? MOBILE_NAV_ITEMS.findIndex((item) => item.id === openDropdownId)
    : -1];

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
                KPU MAHASISWA
              </span>
              <span className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-semibold">
                Politeknik LP3I
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Lengkap & Rapi) */}
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                    ? 'bg-blue-700 text-white shadow-sm dark:bg-blue-600 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-zinc-900'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Tools: ThemeToggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Backdrop penutup saat sub-menu dropdown aktif di mobile */}
      {openDropdownId && (
        <div
          onClick={() => setOpenDropdownId(null)}
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Popover Sub-Menu UL-LI Mengambang di atas Navbar Mobile */}
      {activeItem && activeItem.isDropdown && (
        <div className="md:hidden fixed bottom-20 left-3 right-3 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-blue-200/90 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 space-y-2">
            {/* Header Dropdown */}
            <div className="flex items-center justify-between px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <activeItem.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Menu {activeItem.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpenDropdownId(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List UL - LI Menu */}
            <ul className="space-y-1.5 pt-1">
              {activeItem.subItems.map((sub) => {
                const isSubActive = pathname.startsWith(sub.href);
                const SubIcon = sub.icon;
                return (
                  <li key={sub.href}>
                    <Link
                      href={sub.href}
                      onClick={() => setOpenDropdownId(null)}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${isSubActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSubActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                            }`}
                        >
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold leading-tight">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                            {sub.desc}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${isSubActive ? 'text-blue-600 dark:text-blue-400 translate-x-0.5' : 'text-zinc-400'
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

      {/* Mobile Bottom Navigation Bar (5 Menu dengan Efek 3D Bulat Menembus & Menyatu dengan Navbar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t border-blue-200/80 dark:border-zinc-800 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_25px_rgba(0,0,0,0.5)] safe-area-bottom overflow-visible">
        {/* Grid 5 Kolom Sempurna Tanpa Padding Asimetris */}
        <div className="relative grid grid-cols-5 w-full h-16 overflow-visible">
          {/* Animated 3D Sliding Notch & Bulatan yang MENYATU dengan warna navbar (bukan biru) */}
          {activeMobileIndex >= 0 && (
            <div
              className="absolute top-0 bottom-0 left-0 w-1/5 pointer-events-none transition-transform duration-300 ease-out z-20 flex items-center justify-center"
              style={{
                transform: `translateX(${activeMobileIndex * 100}%)`,
              }}
            >
              {/* Bulatan yang sewarna dengan navbar (putih di light, hitam di dark) dengan border 3D */}
              <div className="relative -top-4 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-black border-[3px] border-blue-200/90 dark:border-zinc-800 shadow-[0_-6px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_-6px_22px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-300">
                  {/* Subtle inner ring aksen lembut yang tetap menyatu dengan bg */}
                  <div className="w-11 h-11 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 shadow-inner" />
                </div>
              </div>
            </div>
          )}

          {/* 5 Menu Items (Tiap item mengisi tepat 1 kolom grid 20%) */}
          {MOBILE_NAV_ITEMS.map((item, idx) => {
            const isActive = idx === activeMobileIndex;
            const Icon = item.icon;

            const handleClick = (e) => {
              if (item.isDropdown) {
                e.preventDefault();
                setOpenDropdownId((prev) => (prev === item.id ? null : item.id));
              }
            };

            const content = isActive ? (
              <div className="relative flex flex-col items-center justify-center w-full h-full">
                {/* Icon Menu Aktif: Persis di tengah sumbu lingkaran (simetris sempurna di semua tab), warna biru aksen */}
                <div className="w-14 h-14 flex items-center justify-center -translate-y-4 transition-transform duration-300">
                  <Icon className="w-6.5 h-6.5 text-blue-600 dark:text-blue-400 drop-shadow-xs" />
                </div>

                {/* Teks Label Menu Aktif: Simetris di bawah bulatan, tanpa truncate */}
                <span className="absolute bottom-1.5 text-[9.5px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap tracking-tight transition-all duration-300">
                  {item.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 w-full h-full">
                {/* Icon Menu Biasa */}
                <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />

                {/* Teks Label Menu Biasa: Tampil penuh */}
                <span className="text-[9.5px] font-medium whitespace-nowrap leading-none transition-all duration-300">
                  {item.name}
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
                  aria-expanded={openDropdownId === item.id}
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
