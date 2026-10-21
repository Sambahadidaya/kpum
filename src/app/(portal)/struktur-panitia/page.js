import { getPublikPanitia } from '@/api/publlic/panitia';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import StrukturPanitiaClient from '@/components/public/StrukturPanitiaClient';
import PanitiaHeroHeader from '@/components/public/PanitiaHeroHeader';

export const metadata = {
  title: 'Struktur Panitia KPU - Pemilu Raya Mahasiswa LP3I',
  description: 'Daftar dan susunan Komisi Pemilihan Umum Mahasiswa Badan Eksekutif Mahasiswa (BEM) Politeknik LP3I.',
};

export default async function PanitiaPortalPage() {
  const result = await getPublikPanitia();
  const panitiaList = result.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section dengan BgWaveDivider Mulus Full-Bleed */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <PanitiaHeroHeader />

        {/* BgWaveDivider Sambungan Mulus Tanpa Garis Border Terputus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Utama Daftar Panitia Per Jabatan */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <StrukturPanitiaClient panitiaList={panitiaList} />
      </div>
    </div>
  );
}
