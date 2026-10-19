import { getPublikPanitia } from '@/api/publlic/panitia';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import StrukturPanitiaClient from '@/components/public/StrukturPanitiaClient';
import { ShieldCheck } from 'lucide-react';

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
        <div className="max-w-7xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Penyelenggara Pemilu Raya Mahasiswa</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            Susunan Panitia KPU Mahasiswa
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Mengenal jajaran panitia independen yang bertugas merencanakan, melaksanakan, dan mengawal seluruh tahapan Pemilihan Umum Mahasiswa Politeknik LP3I.
          </p>
        </div>

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
