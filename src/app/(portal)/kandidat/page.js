import { getPublikKandidat } from '@/api/publlic/kandidat';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import KandidatPortalClient from '@/components/public/KandidatPortalClient';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'Daftar Kandidat - KPU Mahasiswa Politeknik LP3I',
  description: 'Profil lengkap Calon Presiden dan Calon Wakil Presiden Mahasiswa Politeknik LP3I yang lolos verifikasi.',
};

export default async function KandidatPortalPage() {
  const result = await getPublikKandidat();
  const kandidatList = result.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section dengan BgWaveDivider Mulus Full-Bleed */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
            <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Peserta Pemilu Raya Mahasiswa</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            Calon Pemimpin Mahasiswa
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Mengenal profil, visi, dan misi kandidat calon pemimpin Badan Eksekutif Mahasiswa (BEM) Politeknik LP3I yang telah lolos tahapan verifikasi seleksi KPU.
          </p>
        </div>

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Utama Daftar Kandidat */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <KandidatPortalClient kandidatList={kandidatList} />
      </div>
    </div>
  );
}
