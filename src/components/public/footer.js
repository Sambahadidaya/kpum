'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MessageSquare, ArrowRight, ChevronRight } from 'lucide-react';
import logoKpu from '@/aseets/logo.png';
import { NAV_LINKS } from './navbar';

export default function PublicFooter() {
  const pathname = usePathname();

  return (
    <footer className="w-full bg-slate-50/90 dark:bg-black border-t border-blue-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 py-12 px-4 sm:px-6 z-20 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 mb-8">
        {/* Kolom 1: Profil KPU Mahasiswa (Span 4) */}
        <div className="space-y-4 md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src={logoKpu}
                alt="Logo KPU LP3I"
                width={40}
                height={40}
                className="object-cover w-full h-full scale-105"
              />
            </div>
            <div>
              <h3 className="text-blue-950 dark:text-zinc-100 font-extrabold text-sm tracking-wide">
                KOMISI PEMILIHAN UMUM MAHASISWA
              </h3>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                Politeknik LP3I
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
            Penyelenggara resmi Pemilihan Umum Raya Presiden & Wakil Presiden Mahasiswa Badan Eksekutif Mahasiswa (BEM) Politeknik LP3I yang berasaskan langsung, umum, bebas, rahasia, jujur, dan adil demi kepemimpinan mahasiswa yang berintegritas.
          </p>

          {/* Social Media Links */}
          <div className="flex items-center gap-2.5 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 flex items-center justify-center text-blue-900 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-white hover:border-blue-400 transition"
              aria-label="Instagram KPU LP3I"
            >
              <i className="fa-brands fa-instagram text-xs" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 flex items-center justify-center text-blue-900 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-white hover:border-blue-400 transition"
              aria-label="TikTok KPU LP3I"
            >
              <i className="fa-brands fa-tiktok text-xs" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 flex items-center justify-center text-blue-900 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-white hover:border-blue-400 transition"
              aria-label="YouTube KPU LP3I"
            >
              <i className="fa-brands fa-youtube text-xs" />
            </a>
            <a
              href="https://wa.me"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 flex items-center justify-center text-blue-900 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-white hover:border-blue-400 transition"
              aria-label="WhatsApp KPU LP3I"
            >
              <i className="fa-brands fa-whatsapp text-xs" />
            </a>
          </div>
        </div>

        {/* Kolom 2: Tautan Navigasi (Span 4) - Dibagi Menjadi 2 Kolom Link */}
        <div className="space-y-3 md:col-span-4">
          <h4 className="text-blue-950 dark:text-zinc-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-blue-700 dark:bg-blue-400 rounded-full" />
            Tautan Navigasi
          </h4>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 py-1 px-1.5 rounded-lg transition-all w-full ${
                      isActive
                        ? 'text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/40'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-blue-300'
                    }`}
                  >
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'opacity-40'}`} />
                    <span className="truncate">{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Kolom 3: Ajakan Bertanya & Menuju Halaman Kontak (Span 4) - Menyatu dengan Footer Tanpa Card BG */}
        <div className="space-y-3 md:col-span-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <h4 className="text-blue-950 dark:text-zinc-100 uppercase tracking-wider">
              Ada Pertanyaan Seputar Pemilu?
            </h4>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Punya kendala status pemilih, ingin berkonsultasi mengenai tahapan, atau ingin menyampaikan aspirasi kepada panitia KPU Mahasiswa?
          </p>
          <div className="pt-1">
            <Link
              href="/contact"
              className="inline-flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs shadow-xs transition-all group"
            >
              <span>Hubungi Panitia & Kirim Pesan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Baris Bawah: Hak Cipta */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-blue-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
        <p>© {new Date().getFullYear()} Komisi Pemilihan Umum Mahasiswa Politeknik LP3I. Seluruh hak cipta dilindungi.</p>
        <p className="text-blue-900/60 dark:text-zinc-500 font-medium">Sistem Informasi Terpadu Pemilu Raya BEM</p>
      </div>
    </footer>
  );
}
