import Link from 'next/link';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import { Vote, ShieldCheck, CheckCircle2, KeyRound, UserCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'E-Voting Pemilu Raya Mahasiswa - KPU Politeknik LP3I',
  description: 'Gunakan hak suara Anda dalam Pemilihan Umum Raya Presiden Mahasiswa Politeknik LP3I.',
};

export default function VotingLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-blue-50/60 dark:bg-[#0b0f19]">
        <div className="max-w-4xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
            <Vote className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Bilik Suara Elektronik Resmi (E-Voting)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            Pemungutan Suara Pemilu Mahasiswa
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Salurkan hak pilih Anda secara jujur, adil, rahasia, dan langsung melalui sistem e-voting terintegrasi KPU Mahasiswa Politeknik LP3I.
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              href="/voting/login"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
            >
              <span>Masuk ke Bilik Suara</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten 3 Langkah Pemilihan (Warna Netral) */}
      <div className="flex-1 py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            3 Langkah Menggunakan Hak Suara
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pastikan Anda telah memiliki Kode Voting resmi dari Panitia KPU Mahasiswa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Langkah 1 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-black text-sm">
              01
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Verifikasi DPT Mahasiswa
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Masukkan Nama Lengkap, NIM, serta Kode Voting unik yang telah dibagikan panitia untuk masuk ke sistem.
            </p>
          </div>

          {/* Langkah 2 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-black text-sm">
              02
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pilih Pasangan Calon
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tinjau profil, visi misi, dan tentukan pilihan pasangan calon presiden & wakil presiden mahasiswa terbaik Anda.
            </p>
          </div>

          {/* Langkah 3 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-black text-sm">
              03
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Konfirmasi & Selesai
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Konfirmasi pilihan Anda. Suara tercatat secara anonim dan hak suara Anda selesai digunakan (1 kali voting).
            </p>
          </div>
        </div>

        {/* Informasi Keamanan */}
        <div className="p-5 sm:p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Kerahasiaan dan Keamanan Terjamin
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Setiap pemilih hanya memiliki 1 kali kesempatan voting dan sistem mencatat suara secara terenkripsi.
              </p>
            </div>
          </div>

          <Link
            href="/voting/login"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-white transition"
          >
            Mulai Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
