'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { catatTrafikKunjungan } from '@/api/publlic/trafik';

export default function ClientTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef('');

  useEffect(() => {
    // Hindari tracking berulang di path yang persis sama dalam 1 sesi singkat
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    try {
      const referrer = typeof document !== 'undefined' ? document.referrer : '';
      const utmSource = searchParams?.get('utm_source') || searchParams?.get('ref') || '';

      // Kirim tracking ke server action
      catatTrafikKunjungan({
        referrer,
        utmSource,
        path: pathname,
      }).catch(() => {
        // Abaikan error pada sisi klien
      });
    } catch (e) {
      // Abaikan error klien
    }
  }, [pathname, searchParams]);

  return null;
}
