import BgWaveDivider from '@/components/public/bgWaveDivider';
import PaslonPortalClient from '@/components/public/PaslonPortalClient';
import PortalHeroHeader from '@/components/public/PortalHeroHeader';

export const metadata = {
  title: 'Pasangan Calon (Paslon) - KPU Pemilu BEM LP3I',
  description: 'Daftar resmi pasangan calon Presiden dan Wakil Presiden Mahasiswa Politeknik LP3I beserta nomor urut, visi, misi, dan gagasan.',
};

export default function PaslonPortalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <PortalHeroHeader section="paslon" />

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Utama Slider Card Paslon */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <PaslonPortalClient />
      </div>
    </div>
  );
}
