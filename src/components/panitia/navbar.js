'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  Users,
  Vote,
  FolderKanban,
  BookOpen,
  Mail,
  UserCheck,
  CalendarDays,
  ShieldCheck,
  KeyRound,
  Globe,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  BarChart3,
  PieChart,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { logoutPanitia } from '@/api/panitia/auth';
import { hasPermission } from '@/lib/adminRoleData';
import logoKpu from '@/aseets/logo.png';

const MENU_GROUPS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      { name: 'Dashboard', href: '/panitia/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
      { name: 'Manajemen Trafik', href: '/panitia/trafik', icon: Activity, permission: 'trafik' },
    ],
  },
  {
    id: 'kandidat',
    title: 'Kandidat',
    items: [
      { name: 'Manajemen Kandidat', href: '/panitia/kandidat', icon: Users, permission: 'kandidat' },
      { name: 'Manajemen Paslon', href: '/panitia/paslon', icon: Vote, permission: 'paslon' },
    ],
  },
  {
    id: 'dataMhs',
    title: 'Data Mhs',
    items: [
      { name: 'Manajemen Data Mhs', href: '/panitia/mhs', icon: GraduationCap, permission: 'mhs' },
      { name: 'Dashboard Data Mhs', href: '/panitia/mhs/dashboard', icon: BarChart3, permission: 'mhs' },
    ],
  },
  {
    id: 'voting',
    title: 'Voting',
    items: [
      { name: 'Dashboard Voting', href: '/panitia/voting', icon: PieChart, permission: 'voting' },
      { name: 'Manajemen Voting', href: '/panitia/voting/manajemen', icon: ClipboardList, permission: 'voting' },
    ],
  },
  {
    id: 'dataPanitia',
    title: 'Data Panitia',
    items: [
      { name: 'Struktur Panitia', href: '/panitia/panitia', icon: UserCheck, permission: 'panitia' },
      { name: 'Trafik Sosmed', href: '/panitia/panitia/trafik-sosmed', icon: BarChart3, permission: 'trafik_sosmed' },
    ],
  },
  {
    id: 'sekretaris',
    title: 'Sekretaris',
    items: [
      { name: 'Dashboard', href: '/panitia/sekretaris', icon: LayoutDashboard, permission: 'sekretaris' },
      { name: 'Judul Absensi Panitia', href: '/panitia/sekretaris/judul-absensi', icon: ClipboardList, permission: 'sekretaris' },
      { name: 'Absensi Panitia', href: '/panitia/sekretaris/absensi', icon: UserCheck, permission: 'sekretaris' },
    ],
  },
  {
    id: 'informasi',
    title: 'Informasi',
    items: [
      { name: 'Manajemen Dokumentasi', href: '/panitia/dokumentasi', icon: FolderKanban, permission: 'dokumentasi' },
      { name: 'Panduan Pemilu', href: '/panitia/panduan', icon: BookOpen, permission: 'panduan' },
      { name: 'Pesan Kontak', href: '/panitia/contact', icon: Mail, permission: 'contact' },
      { name: 'Jadwal Acara', href: '/panitia/jadwal', icon: CalendarDays, permission: 'jadwal' },
    ],
  },
  {
    id: 'setting',
    title: 'Setting',
    items: [
      { name: 'Manajemen Akun', href: '/panitia/akun', icon: ShieldCheck, permission: 'akun', superAdminOnly: true },
      { name: 'Manajemen Role Akses', href: '/panitia/roleakses', icon: KeyRound, permission: 'roleakses', superAdminOnly: true },
    ],
  },
];

export default function PanitiaNavbar({ currentAdmin, collapsed = false, toggleCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // State untuk collapsible group menu - DEFAULT SEMUA TERTUTUP sesuai permintaan
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const isSuperAdmin = currentAdmin?.role === 'superAdmin';

  const canAccess = (item) => {
    if (isSuperAdmin) return true;
    if (item.superAdminOnly) return false;
    if (!item.permission) return true;
    return hasPermission(currentAdmin?.role, item.permission, currentAdmin?.roleAkses);
  };

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari panel panitia?')) {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('kpu_') || key.startsWith('panitia_')) {
              localStorage.removeItem(key);
            }
          });
        }
      } catch (e) {}

      await logoutPanitia();
      router.push('/panitia/login');
      router.refresh();
    }
  };

  return (
    <>
      {/* Top Banner Bar Panitia (Desktop Only) */}
      <div className="hidden lg:flex w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 px-6 py-2.5 items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 transition-colors z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Panel Panitia KPU Mahasiswa</span>
          <span className="text-zinc-400 dark:text-zinc-600">•</span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono">
            {currentAdmin?.role || 'Admin'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-semibold transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Kembali ke Website Publik</span>
          </Link>

          <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800" />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Panitia Header Mobile (FIXED STICKY DI ATAS saat scroll) */}
      <header className="lg:hidden sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-black/95 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer active:scale-95 transition"
            aria-label="Buka Menu Panitia"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white shrink-0 border border-zinc-200 dark:border-zinc-700">
              <Image src={logoKpu} alt="Logo" fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-tight">
                {currentAdmin?.nama || 'Admin Panitia'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {currentAdmin?.role || 'Panitia'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition active:scale-95"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tombol Toggle Buka Navbar saat Collapsed - BERADA DI LUAR NAVBAR agar logo tidak tertutupi */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex fixed left-20 top-3.5 z-40 p-2 rounded-r-xl bg-white dark:bg-zinc-900 border border-l-0 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 items-center justify-center group"
          title="Buka Sidebar Navigasi"
          aria-label="Buka Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Desktop Sidebar (Collapsible: w-64 vs w-20) */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src={logoKpu}
                alt="Logo KPU LP3I"
                width={36}
                height={36}
                priority
                className="object-cover w-full h-full scale-105"
              />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h2 className="text-xs font-black text-blue-950 dark:text-zinc-100 leading-tight">PANEL PANITIA</h2>
                <p className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold truncate">KPU Raya LP3I</p>
              </div>
            )}
          </div>

          {/* Tombol Tutup Navbar saat Expanded (Di dalam navbar) */}
          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
              title="Sembunyikan Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Card */}
        {!collapsed ? (
          <div className="p-3.5 mx-3 my-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{currentAdmin?.nama || 'Administrator'}</p>
            <p className="text-[10px] text-zinc-500 font-mono truncate">NIM: {currentAdmin?.nim || '-'}</p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-[9px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              {isSuperAdmin ? 'SuperAdmin' : 'Panitia'}
            </div>
          </div>
        ) : (
          <div className="py-2 flex justify-center">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
              title={`${currentAdmin?.nama} (${currentAdmin?.role})`}
            />
          </div>
        )}

        {/* Navigation Items (Grouped UL - LI dengan Collapsible Accordion) */}
        <nav className="flex-1 px-2.5 py-2 space-y-3 overflow-y-auto">
          {MENU_GROUPS.map((group) => {
            const visibleItems = group.items.filter(canAccess);
            if (visibleItems.length === 0) return null;

            const isGroupOpen = Boolean(openGroups[group.id]);

            return (
              <div key={group.id} className="space-y-1">
                {/* Header Group dengan Fitur Collapsible Klik */}
                {!collapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {group.title}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isGroupOpen ? 'rotate-180 text-blue-600' : 'text-zinc-400'
                      }`}
                    />
                  </button>
                ) : (
                  <div className="h-px bg-zinc-200 dark:border-zinc-800 my-1 mx-2" />
                )}

                {/* Daftar Menu UL LI (Bisa Ditutup Default Tertutup saat Expanded, selalu tampil icon saat Collapsed) */}
                {(!collapsed ? isGroupOpen : true) && (
                  <ul className="space-y-0.5 transition-all duration-200">
                    {visibleItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            title={collapsed ? item.name : undefined}
                            className={`flex items-center ${
                              collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                            } rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className="w-4 h-4 shrink-0" />
                              {!collapsed && <span className="truncate">{item.name}</span>}
                            </div>
                            {!collapsed && isActive && (
                              <ChevronRight className="w-3.5 h-3.5 opacity-70 shrink-0" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <Link
            href="/"
            title={collapsed ? 'Ke Portal Publik' : undefined}
            className={`flex items-center ${
              collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            } rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Ke Portal Publik</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Keluar Sistem' : undefined}
            className={`flex items-center ${
              collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            } w-full rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Keluar Sistem</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 p-5 flex flex-col h-full z-10 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <Image src={logoKpu} alt="Logo" fill className="object-cover" />
                </div>
                <div>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs block">
                    PANEL PANITIA
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {currentAdmin?.role || 'Admin'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-3 overflow-y-auto">
              {MENU_GROUPS.map((group) => {
                const visibleItems = group.items.filter(canAccess);
                if (visibleItems.length === 0) return null;

                const isGroupOpen = Boolean(openGroups[group.id]);

                return (
                  <div key={group.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {group.title}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isGroupOpen ? 'rotate-180 text-blue-600' : 'text-zinc-400'
                        }`}
                      />
                    </button>
                    {isGroupOpen && (
                      <ul className="space-y-1">
                        {visibleItems.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setMobileDrawerOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                                  isActive
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                <span>{item.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Panel</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
