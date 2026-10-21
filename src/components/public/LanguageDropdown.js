'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown, Check, Globe } from 'lucide-react';
import CountryFlag from '@/components/public/CountryFlag';

export default function LanguageDropdown() {
  const { lang, languages, changeLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.kode === lang) || {
    kode: 'id',
    nama: 'Bahasa Indonesia',
    flag: '🇮🇩',
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Trigger: Hanya Icon Bendera Negara Asli + Chevron (Bukan inisial OS) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs"
        aria-label="Pilih Bahasa Situs"
        title={`Bahasa Aktif: ${currentLang.nama}`}
      >
        <CountryFlag code={currentLang.kode} className="w-5 h-3.5" />
        <ChevronDown
          className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              <span>{t('umum.bahasa_situs', 'Bahasa Situs')}</span>
            </span>
          </div>

          <div className="space-y-0.5 px-1">
            {languages.map((l) => {
              const isSelected = l.kode === lang;

              return (
                <button
                  key={l.kode}
                  type="button"
                  onClick={() => handleSelect(l.kode)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CountryFlag code={l.kode} className="w-5 h-3.5" />
                    <span className="truncate">{l.nama}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
