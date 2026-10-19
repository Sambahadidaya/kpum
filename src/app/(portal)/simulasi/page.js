import Link from 'next/link';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import { FlaskConical, ShieldAlert, CheckCircle2, ArrowRight, Info, Eye } from 'lucide-react';

export const metadata = {
  title: 'Simulasi E-Voting - KPU Politeknik LP3I',
  description: 'Coba pengalaman e-voting secara simulasi tanpa menyimpan data apapun. Latihan sebelum hari pemilihan resmi.',
};

export default function SimulasiLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Header Section */}
      <div className="relative pt-10 sm:pt-16 pb-0 bg-amber-50/60 dark:bg-[#120f00]">
        <div className="max-w-4xl mx-auto text-center space-y-3 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <FlaskConical className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Mode Simulasi — Data Tidak Tersimpan</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-950 dark:text-zinc-100 tracking-tight">
            Simulasi Pemungutan Suara
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Coba rasakan pengalaman e-voting secara langsung tanpa memengaruhi data suara resmi. 
            Akun demo sudah disiapkan — tidak diperlukan kode voting asli.
          </p>

          {/* Disclaimer box */}
          <div className="mx-auto max-w-xl p-3.5 rounded-2xl bg-amber-100/70 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-800/50 flex items-start gap-2.5 text-left">
            <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-bold">Perhatian:</span> Ini adalah mode simulasi. Pilihan yang Anda buat 
              <span className="font-bold"> tidak akan disimpan</span> ke database maupun penyimpanan lokal. 
              Suara simulasi tidak dihitung dalam hasil pemilihan resmi.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link
              href="/simulasi/login"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
            >
              <span>Mulai Simulasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* BgWaveDivider Sambungan Mulus */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-white dark:text-black" />
        </div>
      </div>

      {/* Konten Penjelasan */}
      <div className="flex-1 py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Bagaimana Simulasi Ini Bekerja?
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Simulasi dirancang semirip mungkin dengan sistem voting resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Langkah 1 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-800 dark:text-amber-300 font-black text-sm">
              01
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Login Demo Otomatis
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Halaman login simulasi sudah terisi otomatis dengan akun demo. Anda cukup klik tombol masuk tanpa perlu memasukkan data apapun.
            </p>
          </div>

          {/* Langkah 2 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-800 dark:text-amber-300 font-black text-sm">
              02
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pilih Pasangan Calon
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Geser dan lihat profil pasangan calon. Pilih salah satu sesuai preferensi Anda untuk merasakan alur voting sesungguhnya.
            </p>
          </div>

          {/* Langkah 3 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-800 dark:text-amber-300 font-black text-sm">
              03
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Lihat Konfirmasi
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Konfirmasi pilihan Anda dan lihat tampilan hasil simulasi. Tidak ada data yang tersimpan — pilihan hilang setelah sesi berakhir.
            </p>
          </div>
        </div>

        {/* Banner Simulasi vs Resmi */}
        <div className="p-5 sm:p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Simulasi Hanya untuk Latihan
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Untuk voting resmi, gunakan menu E-Voting dengan kode voting yang diberikan panitia.
              </p>
            </div>
          </div>

          <Link
            href="/voting"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-white transition"
          >
            Ke E-Voting Resmi
          </Link>
        </div>
      </div>
    </div>
  );
}
