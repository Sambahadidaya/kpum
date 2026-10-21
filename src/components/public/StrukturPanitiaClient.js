'use client';

import { useState, useRef, useMemo } from 'react';
import PanitiaCard from '@/components/public/PanitiaCard';
import PanitiaFullscreenModal from '@/components/public/PanitiaFullscreenModal';
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Filter,
  Users,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

function PanitiaJabatanRow({ jabatanName, members, onEnlarge }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      // Pada desktop geser per kartu (~50% container), pada mobile geser penuh kartu (~100% container)
      const scrollAmount =
        direction === 'left'
          ? -(containerWidth >= 768 ? containerWidth / 2 : containerWidth)
          : containerWidth >= 768 ? containerWidth / 2 : containerWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Jabatan dengan Tombol Navigasi Horizontal Scroll */}
      <div className="flex items-center justify-between pb-3 border-b border-blue-100/70 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-blue-950 dark:text-zinc-100">
              {jabatanName}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              {members.length} {t('panitia.members_count', 'Anggota Terdaftar')}
            </p>
          </div>
        </div>

        {/* Tombol Geser Horizontal (Kiri/Kanan) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-blue-950 dark:text-zinc-300 border border-blue-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer shadow-xs"
            aria-label={`Geser ke kiri ${jabatanName}`}
          >
            <ChevronLeft className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-blue-950 dark:text-zinc-300 border border-blue-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer shadow-xs"
            aria-label={`Geser ke kanan ${jabatanName}`}
          >
            <ChevronRight className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Row (seperti dokumentasi) */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'thin' }}
      >
        {members.map((panitia, idx) => (
          <PanitiaCard
            key={panitia.id || idx}
            panitia={panitia}
            index={idx}
            onEnlarge={onEnlarge}
          />
        ))}
      </div>
    </div>
  );
}

export default function StrukturPanitiaClient({ panitiaList = [] }) {
  const [selectedJabatan, setSelectedJabatan] = useState('all');
  const [fullscreenPanitia, setFullscreenPanitia] = useState(null);

  // Kelompokkan panitia berdasarkan jabatan_panitia
  const { groupedByJabatan, uniqueJabatanList } = useMemo(() => {
    const groups = {};
    const order = [];

    panitiaList.forEach((item) => {
      const jab = (item.jabatan_panitia || 'Anggota Panitia').trim();
      if (!groups[jab]) {
        groups[jab] = [];
        order.push(jab);
      }
      groups[jab].push(item);
    });

    return {
      groupedByJabatan: groups,
      uniqueJabatanList: order,
    };
  }, [panitiaList]);

  // Filter kelompok yang ditampilkan
  const displayedJabatanList = useMemo(() => {
    if (selectedJabatan === 'all') {
      return uniqueJabatanList;
    }
    return uniqueJabatanList.filter((jab) => jab === selectedJabatan);
  }, [uniqueJabatanList, selectedJabatan]);

  if (panitiaList.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white/90 dark:bg-zinc-950/90 border border-blue-100 dark:border-zinc-800 max-w-md mx-auto space-y-3 shadow-xs my-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-zinc-900 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-blue-950 dark:text-zinc-100">
          Data Panitia Sedang Diperbarui
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Daftar susunan panitia KPU sedang dalam tahap finalisasi surat keputusan kepengurusan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Bar Filter Dropdown Jabatan di Atas Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/20 border border-blue-100/90 dark:border-zinc-800/90 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-950 dark:text-zinc-100">
          <Filter className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
          <span>Filter Berdasarkan Jabatan:</span>
        </div>

        {/* Dropdown Select Jabatan */}
        <div className="relative w-full sm:w-72">
          <select
            value={selectedJabatan}
            onChange={(e) => setSelectedJabatan(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl bg-blue-50/60 dark:bg-zinc-950 border border-blue-200/80 dark:border-zinc-800 text-xs font-semibold text-blue-950 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer transition shadow-xs"
          >
            <option value="all">
              Semua Jabatan ({panitiaList.length} Panitia)
            </option>
            {uniqueJabatanList.map((jab) => (
              <option key={jab} value={jab}>
                {jab} ({(groupedByJabatan[jab] || []).length})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Daftar Kelompok Jabatan (Kebawah), Masing-masing Jabatan Scroll Horizontal */}
      <div className="space-y-10 sm:space-y-14">
        {displayedJabatanList.map((jabatanName) => (
          <PanitiaJabatanRow
            key={jabatanName}
            jabatanName={jabatanName}
            members={groupedByJabatan[jabatanName] || []}
            onEnlarge={setFullscreenPanitia}
          />
        ))}
      </div>

      {/* Modal Fullscreen Preview Panitia Terbuka di Root Halaman */}
      <PanitiaFullscreenModal
        panitia={fullscreenPanitia}
        onClose={() => setFullscreenPanitia(null)}
      />
    </div>
  );
}

