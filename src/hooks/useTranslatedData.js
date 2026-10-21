'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const PREFIX = 'kpu_dyn_trans_v2:';

/**
 * Hook pengambil data database yang ikut diterjemahkan sesuai bahasa aktif.
 *
 * - Bahasa 'id'  : data asli DB, tanpa notifikasi terjemahan.
 * - Bahasa lain  : fetcher(lang) memanggil server action (terjemahan AI + Vercel Data Cache).
 *                  Hasilnya disimpan di sessionStorage (otomatis hilang saat tab/website ditutup),
 *                  sehingga membuka ulang halaman yang sama tidak menerjemahkan lagi.
 *
 * @param {string} key      Identitas data, misal 'kandidat'
 * @param {(lang:string)=>Promise<{success:boolean,data:any}>} fetcher
 * @returns {{ data:any, loading:boolean, translating:boolean, lang:string }}
 */
export function useTranslatedData(key, fetcher, initial = []) {
  const { lang } = useTranslation();
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${PREFIX}${key}:${lang}`;

    async function load() {
      if (lang !== 'id') {
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            setData(JSON.parse(cached));
            setLoading(false);
            return;
          }
        } catch (e) {
          // sessionStorage tidak tersedia, lanjut fetch
        }
      }

      setLoading(true);
      try {
        const res = await fetcherRef.current(lang);
        if (cancelled) return;
        const result = res?.success ? res.data ?? initial : initial;
        setData(result);
        if (lang !== 'id' && res?.success) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
          } catch (e) {
            // kuota penuh, abaikan
          }
        }
      } catch (err) {
        console.error(`[useTranslatedData:${key}]`, err);
        if (!cancelled) setData(initial);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, lang]);

  return { data, loading, translating: loading && lang !== 'id', lang };
}
