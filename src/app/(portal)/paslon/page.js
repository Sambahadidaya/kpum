import { getPublikPaslonList } from '@/api/publlic/paslon';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import PaslonSlider from '@/components/public/PaslonSlider';
import { Vote } from 'lucide-react';

export const metadata = {
  title: 'Pasangan Calon (Paslon) - KPU Pemilu BEM LP3I',
  description: 'Daftar resmi pasangan calon Presiden dan Wakil Presiden Mahasiswa Politeknik LP3I beserta nomor urut, visi, misi, dan gagasan.',
};

export default async function PaslonPortalPage() {
  const result = await getPublikPaslonList();
  const paslonList = result.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
            <Vote className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Kontestasi Pemilu Raya Mahasiswa</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            Pasangan Calon Resmi
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Geser kartu untuk meninjau gagasan kepemimpinan, profil lengkap Capres & Cawapres, serta visi misi masing-masing pasangan calon.
          </p>
        </div>

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Utama Slider Card Paslon */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <PaslonSlider
          paslonList={paslonList}
          emptyTitle="Belum Ada Paslon Resmi"
          emptyDesc="Penetapan nomor urut dan pengumuman pasangan calon resmi akan segera diumumkan oleh KPU Mahasiswa."
        />
      </div>
    </div>
  );
}
