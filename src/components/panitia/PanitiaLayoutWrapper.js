'use client';

import { useState, useEffect } from 'react';
import PanitiaNavbar from '@/components/panitia/navbar';

export default function PanitiaLayoutWrapper({ currentAdmin, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('panitia_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('panitia_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      {/* Navbar Panitia dengan Collapsible Sidebar & Mobile Fixed Topbar */}
      {currentAdmin && (
        <PanitiaNavbar
          currentAdmin={currentAdmin}
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        />
      )}

      {/* Konten Utama dengan Margin Kiri Dinamis Menyesuaikan Sidebar Desktop */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          currentAdmin
            ? collapsed
              ? 'lg:pl-20'
              : 'lg:pl-64'
            : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
}
