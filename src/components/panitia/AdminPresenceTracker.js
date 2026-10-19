'use client';

import { useEffect, useRef } from 'react';
import { updateAdminOnlineStatus } from '@/api/panitia/auth';

const ACTIVE_TAB_KEY = 'kpu_panitia_active_tab';
const ACTIVE_TIME_KEY = 'kpu_panitia_active_time';

export default function AdminPresenceTracker() {
  const tabIdRef = useRef('');
  const isOnlineRef = useRef(false);
  const hiddenTimeoutRef = useRef(null);

  useEffect(() => {
    // Generate unique ID untuk tab ini
    const tabId = 'tab_' + Math.random().toString(36).substring(2, 10);
    tabIdRef.current = tabId;

    let heartbeatInterval = null;

    const setOnline = async () => {
      if (hiddenTimeoutRef.current) {
        clearTimeout(hiddenTimeoutRef.current);
        hiddenTimeoutRef.current = null;
      }

      try {
        localStorage.setItem(ACTIVE_TAB_KEY, tabId);
        localStorage.setItem(ACTIVE_TIME_KEY, String(Date.now()));
      } catch (e) {}

      isOnlineRef.current = true;
      try {
        await updateAdminOnlineStatus(true);
      } catch (e) {
        // Abaikan jika jaringan terputus sementara
      }
    };

    const setOffline = async (forceImmediate = false) => {
      const doOffline = async () => {
        // Cek apakah ada tab panitia lain yang sedang aktif
        try {
          const activeTab = localStorage.getItem(ACTIVE_TAB_KEY);
          const activeTime = Number(localStorage.getItem(ACTIVE_TIME_KEY) || '0');
          const isOtherTabRecentlyActive =
            activeTab && activeTab !== tabId && Date.now() - activeTime < 2500;

          if (isOtherTabRecentlyActive && !forceImmediate) {
            // Ada tab lain yang sedang dibuka oleh admin yang sama
            return;
          }
        } catch (e) {}

        isOnlineRef.current = false;
        try {
          await updateAdminOnlineStatus(false);
        } catch (e) {}
      };

      if (forceImmediate) {
        await doOffline();
      } else {
        if (hiddenTimeoutRef.current) {
          clearTimeout(hiddenTimeoutRef.current);
        }
        hiddenTimeoutRef.current = setTimeout(doOffline, 700);
      }
    };

    // Handler ketika tab berubah visibilitas (berpindah tab / minimize / kembali)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setOnline();
      } else {
        setOffline(false);
      }
    };

    // Handler ketika jendela difokuskan atau dibuka kembali
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        setOnline();
      }
    };

    // Handler ketika jendela/tab ditutup atau keluar dari website
    const handlePageHide = () => {
      setOffline(true);
    };

    const handleBeforeUnload = () => {
      try {
        const activeTab = localStorage.getItem(ACTIVE_TAB_KEY);
        if (activeTab === tabId) {
          localStorage.removeItem(ACTIVE_TAB_KEY);
          localStorage.removeItem(ACTIVE_TIME_KEY);
        }
      } catch (e) {}
      updateAdminOnlineStatus(false);
    };

    // Inisialisasi status saat mount jika halaman sedang aktif
    if (document.visibilityState === 'visible') {
      setOnline();
    }

    // Pasang listener browser
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat berkala setiap 45 detik saat tab visible untuk memastikan status tetap aktif
    heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setOnline();
      }
    }, 45000);

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (hiddenTimeoutRef.current) clearTimeout(hiddenTimeoutRef.current);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Jalankan offline saat unmount
      setOffline(true);
    };
  }, []);

  return null;
}
