import { Suspense } from 'react';
import PublicNavbar from '@/components/public/navbar';
import PublicFooter from '@/components/public/footer';
import SamsAsisten from '@/components/SamsAsisten';
import ClientTracker from '@/components/ClientTracker';
import SiteBackground from '@/components/SiteBackground';
import MobileNavHint from '@/components/public/mobileNavHint';
import AdminPresenceTracker from '@/components/panitia/AdminPresenceTracker';

export default function PortalLayout({ children }) {
  return (
    <div className="relative min-h-screen flex flex-col pb-16 md:pb-0">
      <SiteBackground />
      <Suspense fallback={null}>
        <ClientTracker />
        <AdminPresenceTracker />
      </Suspense>
      <PublicNavbar />

      <main className="flex-1 flex flex-col">{children}</main>

      {/* Floating Sams Asisten AI */}
      <SamsAsisten />

      {/* Petunjuk Navigasi Bawah Khusus Mobile (Muncul 1x per sesi) */}
      <MobileNavHint />

      {/* Footer Publik KPU Mahasiswa */}
      <PublicFooter />
    </div>
  );
}
