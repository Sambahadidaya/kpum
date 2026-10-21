import BgWaveDivider from '@/components/public/bgWaveDivider';
import KandidatPortalClient from '@/components/public/KandidatPortalClient';
import PortalHeroHeader from '@/components/public/PortalHeroHeader';

export const metadata = {
  title: 'Daftar Kandidat - KPU Mahasiswa Politeknik LP3I',
  description: 'Profil lengkap Calon Presiden dan Calon Wakil Presiden Mahasiswa Politeknik LP3I yang lolos verifikasi.',
};

export default function KandidatPortalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section dengan BgWaveDivider Mulus Full-Bleed */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <PortalHeroHeader section="kandidat" />

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Utama Daftar Kandidat */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <KandidatPortalClient />
      </div>
    </div>
  );
}
