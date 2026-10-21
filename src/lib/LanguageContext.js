'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import idMessages from '@/messages/id.json';
import enMessages from '@/messages/en.json';
import japanMessages from '@/messages/japan.json';
import arabMessages from '@/messages/arab.json';
import rusiaMessages from '@/messages/rusia.json';

import CountryFlag from '@/components/public/CountryFlag';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'kpu_site_lang';
const COOKIE_KEY = 'NEXT_LOCALE';

export const SUPPORTED_LANGUAGES = [
  { kode: 'id', nama: 'Bahasa Indonesia', flag: '🇮🇩', flagCode: 'id' },
  { kode: 'en', nama: 'English (US)', flag: '🇺🇸', flagCode: 'en' },
  { kode: 'japan', nama: '日本語 (Japan)', flag: '🇯🇵', flagCode: 'japan' },
  { kode: 'arab', nama: 'العربية (Arab)', flag: '🇸🇦', flagCode: 'arab' },
  { kode: 'rusia', nama: 'Русский (Rusia)', flag: '🇷🇺', flagCode: 'rusia' },
];

export { CountryFlag };

const MESSAGES_MAP = {
  id: idMessages,
  en: enMessages,
  japan: japanMessages,
  arab: arabMessages,
  rusia: rusiaMessages,
};

/**
 * Helper untuk mengambil nilai nested object dengan dot notation, misal "hero.title_part1"
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(str, params) {
  if (!params || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('id');
  const [mounted, setMounted] = useState(false);

  // Ambil pilihan bahasa tersimpan saat pertama kali mount
  useEffect(() => {
    let savedLang = 'id';
    try {
      savedLang = localStorage.getItem(STORAGE_KEY) || 'id';
      if (!MESSAGES_MAP[savedLang]) savedLang = 'id';
    } catch (e) {
      savedLang = 'id';
    }
    setLang(savedLang);
    setMounted(true);
  }, []);

  const changeLanguage = useCallback((newLang) => {
    if (!newLang || !MESSAGES_MAP[newLang]) return;
    setLang(newLang);

    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.cookie = `${COOKIE_KEY}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      // ignore
    }
  }, []);

  const activeMessages = useMemo(() => {
    return MESSAGES_MAP[lang] || MESSAGES_MAP['id'];
  }, [lang]);

  /**
   * Helper t(key, fallbackText)
   */
  const t = useCallback(
    (key, fallbackText = '', params = null) => {
      if (!key) return '';

      // Cek di bahasa aktif
      const val = getNestedValue(activeMessages, key);
      if (val !== undefined) return interpolate(val, params);

      // Fallback ke bahasa Indonesia default jika di EN belum ada
      const fallbackVal = getNestedValue(MESSAGES_MAP['id'], key);
      if (fallbackVal !== undefined) return interpolate(fallbackVal, params);

      return interpolate(fallbackText || key, params);
    },
    [activeMessages]
  );

  const contextValue = useMemo(
    () => ({
      lang,
      languages: SUPPORTED_LANGUAGES,
      changeLanguage,
      t,
      messages: activeMessages,
      loading: !mounted,
    }),
    [lang, changeLanguage, t, activeMessages, mounted]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={lang} messages={activeMessages}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'id',
      languages: SUPPORTED_LANGUAGES,
      changeLanguage: () => { },
      t: (key, fallbackText = '', params = null) => {
        const val = getNestedValue(MESSAGES_MAP['id'], key);
        return interpolate(val !== undefined ? val : (fallbackText || key), params);
      },
      messages: MESSAGES_MAP['id'],
      loading: false,
    };
  }
  return context;
}
