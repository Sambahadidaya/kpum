import Link from 'next/link';
import BgWaveDivider from '@/components/public/bgWaveDivider';
import TombolPublik from '@/components/public/tombol';
import {
  Users,
  BookOpen,
  FolderKanban,
  Calendar,
  Vote,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

// Data 8 Jadwal Sesuai Gambar Poster Timeline Kegiatan KPU 2026
const TIMELINE_KPU_2026 = [
  {
    no: '01',
    tanggal: '17 – 19 OKTOBER 2026',
    judul: 'Open Recruitment (Pendaftaran)',
    deskripsi:
      'Open Recruitment (Pendaftaran) Calon Presiden dan Wakil Presiden Mahasiswa Politeknik LP3I.',
    status: 'Aktif',
    // Mobile (2 kolom): Baris 1 Kiri (order-1) -> Garis ke kanan
    // Desktop (4 kolom): Baris 1 Kolom 1 (lg:order-1) -> Garis ke kanan
    orderClass: 'order-1 lg:order-1',
    desktopLine: 'right',
    mobileLine: 'right',
  },
  {
    no: '02',
    tanggal: '21 OKTOBER 2026',
    judul: 'Sosialisasi Kaprodi & Capresma',
    deskripsi:
      'Sosialisasi bersama Ketua Program Studi (Kaprodi) dan Calon Presiden Mahasiswa.',
    status: 'Mendatang',
    // Mobile: Baris 1 Kanan (order-2) -> Garis turun ke bawah menuju 03
    // Desktop: Baris 1 Kolom 2 (lg:order-2) -> Garis ke kanan menuju 03
    orderClass: 'order-2 lg:order-2',
    desktopLine: 'right',
    mobileLine: 'down',
  },
  {
    no: '03',
    tanggal: '23 OKTOBER 2026',
    judul: 'Interview Pertama',
    deskripsi:
      'Pelaksanaan tahap wawancara (Interview Pertama) bagi pasangan calon Presiden dan Wakil Presiden Mahasiswa.',
    status: 'Mendatang',
    // Mobile (Kanan ke Kiri): Baris 2 Kanan (order-4) -> Garis ke kiri menuju 04
    // Desktop: Baris 1 Kolom 3 (lg:order-3) -> Garis ke kanan menuju 04
    orderClass: 'order-4 lg:order-3',
    desktopLine: 'right',
    mobileLine: 'left',
  },
  {
    no: '04',
    tanggal: '26 OKTOBER 2026',
    judul: 'Sosialisasi Dosen',
    deskripsi:
      'Kegiatan sosialisasi pemilihan umum raya mahasiswa kepada jajaran Dosen Politeknik LP3I.',
    status: 'Mendatang',
    // Mobile: Baris 2 Kiri (order-3) -> Garis turun ke bawah menuju 05
    // Desktop: Baris 1 Kolom 4 (lg:order-4) -> Garis turun ke bawah menuju 05
    orderClass: 'order-3 lg:order-4',
    desktopLine: 'down',
    mobileLine: 'down',
  },
  {
    no: '05',
    tanggal: '27 OKTOBER 2026',
    judul: 'Interview Kedua',
    deskripsi:
      'Pelaksanaan tahap wawancara lanjutan (Interview Kedua) pendalaman materi dan komitmen kandidat.',
    status: 'Mendatang',
    // Mobile (Kiri ke Kanan): Baris 3 Kiri (order-5) -> Garis ke kanan menuju 06
    // Desktop (Kanan ke Kiri): Baris 2 Kolom 4 / Paling Kanan (lg:order-8) -> Garis ke kiri menuju 06
    orderClass: 'order-5 lg:order-8',
    desktopLine: 'left',
    mobileLine: 'right',
  },
  {
    no: '06',
    tanggal: '30 OKTOBER 2026',
    judul: 'Debat Tertutup',
    deskripsi:
      'Adu gagasan, pengujian visi-misi, serta program kerja kandidat dalam forum Debat Tertutup.',
    status: 'Mendatang',
    // Mobile: Baris 3 Kanan (order-6) -> Garis turun ke bawah menuju 07
    // Desktop: Baris 2 Kolom 3 (lg:order-7) -> Garis ke kiri menuju 07
    orderClass: 'order-6 lg:order-7',
    desktopLine: 'left',
    mobileLine: 'down',
  },
  {
    no: '07',
    tanggal: '10 NOVEMBER 2026',
    judul: 'Debat Terbuka',
    deskripsi:
      'Penyampaian visi-misi, orasi gagasan, dan Debat Terbuka di hadapan seluruh civitas akademika LP3I.',
    status: 'Mendatang',
    // Mobile (Kanan ke Kiri): Baris 4 Kanan (order-8) -> Garis ke kiri menuju 08
    // Desktop: Baris 2 Kolom 2 (lg:order-6) -> Garis ke kiri menuju 08
    orderClass: 'order-8 lg:order-6',
    desktopLine: 'left',
    mobileLine: 'left',
  },
  {
    no: '08',
    tanggal: '12 NOVEMBER 2026',
    judul: 'Pencoblosan',
    deskripsi:
      'Hari pemungutan suara (Pencoblosan) serentak Presiden & Wakil Presiden Mahasiswa BEM Politeknik LP3I.',
    status: 'Puncak Acara',
    // Mobile: Baris 4 Kiri (order-7) -> Selesai
    // Desktop: Baris 2 Kolom 1 / Paling Kiri (lg:order-5) -> Selesai
    orderClass: 'order-7 lg:order-5',
    desktopLine: 'none',
    mobileLine: 'none',
  },
];

export default function BerandaPortalPage() {
  return (
    <div className="relative w-full flex flex-col transition-colors md:-mt-8 bg-dot-matrix">
      {/* =====================================================================
          SECTION 1: HERO SECTION
         ===================================================================== */}
      <section className="relative flex flex-col justify-between pt-12 sm:pt-20 lg:pt-24 pb-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] text-zinc-900 dark:text-zinc-100">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12">
          {/* Kolom Kiri: Teks Informasi Utama */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
              <span>Portal Resmi KPU Mahasiswa Politeknik LP3I</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Suara Mahasiswa, <br />
              <span className="text-blue-700 dark:text-blue-400">
                Masa Depan BEM LP3I
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed">
              Selamat datang di portal informasi resmi Pemilihan Umum Raya Presiden dan Wakil Presiden Mahasiswa Politeknik LP3I. Kenali calon pemimpin, pelajari tata cara pemilihan, dan gunakan hak suara Anda secara bijak.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <TombolPublik
                href="/kandidat"
                variant="primary"
                size="lg"
                icon={Users}
              >
                Lihat Calon Kandidat
              </TombolPublik>

              <TombolPublik
                href="/panduan"
                variant="secondary"
                size="lg"
                icon={BookOpen}
              >
                Tata Cara Memilih
              </TombolPublik>
            </div>

            {/* Quick Badges Asas Pemilu */}
            <div className="pt-4 flex flex-wrap items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-bold text-blue-950 dark:text-blue-300">
                Asas Pemilu:
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium">
                Langsung
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium">
                Umum
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium">
                Bebas
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium">
                Rahasia
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50/80 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 font-medium">
                Jujur & Adil
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Visual 3D Interactive Ballot Box + Animasi Cahaya Kanan Atas ke Bawah & Hover Border Muter */}
          <div className="lg:col-span-5 flex justify-center perspective-card-container py-6">
            <div className="ballot-box-3d w-full max-w-md rounded-3xl p-[2px] relative cursor-pointer group">
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white dark:bg-zinc-950 border border-blue-200/80 dark:border-blue-900/60 group-hover:border-transparent transition-colors duration-300">

                {/* 1. ANIMASI BORDER MUTER KETIKA DI-HOVER */}
                <div className="pointer-events-none absolute -inset-[120%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-spin bg-[conic-gradient(from_0deg,transparent_0_250deg,#2563eb_300deg,#60a5fa_335deg,#93c5fd_360deg)] z-0" />

                {/* 2. INNER CARD CONTENT */}
                <div className="relative z-10 m-[1.5px] rounded-[22px] bg-white dark:bg-zinc-950 p-6 sm:p-7 overflow-hidden">

                  {/* 3. ANIMASI TRANSISI CAHAYA DARI POJOK KANAN ATAS KE POJOK KANAN BAWAH */}
                  {/* <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-36 overflow-hidden z-20">
                    <div className="animate-light-sweep-right absolute -right-8 w-28 h-44 rounded-full bg-gradient-to-b from-blue-400/0 via-cyan-400/35 to-blue-600/0 dark:via-blue-400/30 blur-xl" />
                    <div className="animate-light-sweep-right absolute right-0 w-[3px] h-32 bg-gradient-to-b from-transparent via-blue-500 dark:via-cyan-300 to-transparent shadow-[0_0_16px_#3b82f6]" />
                  </div> */}

                  {/* Header Card */}
                  <div className="relative z-10 flex items-center justify-between pb-5 border-b border-blue-100 dark:border-zinc-800 layer-float-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 dark:bg-blue-600 text-white shadow-xs flex items-center justify-center font-black">
                        <Vote className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-blue-950 dark:text-zinc-100 font-extrabold text-sm tracking-wide">
                          SURAT SUARA DIGITAL
                        </h3>
                        <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                          Pemilu Raya Presma BEM
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                      TAHAPAN AKTIF
                    </span>
                  </div>

                  {/* Status Pemilihan */}
                  <div className="relative z-10 py-5 space-y-4 layer-float-md">
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-zinc-900/90 border border-blue-100 dark:border-zinc-800 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Kategori:
                        </span>
                        <span className="text-blue-950 dark:text-zinc-100 font-semibold">
                          Presiden & Wapresma Mahasiswa
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Tempat:
                        </span>
                        <span className="text-blue-950 dark:text-zinc-100 font-semibold">
                          Kampus Politeknik LP3I
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Penyelenggara:
                        </span>
                        <span className="text-blue-700 dark:text-blue-400 font-bold">
                          Panitia KPUM 2025/2026
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Tahapan Berjalan
                        </span>
                        <span className="text-blue-950 dark:text-zinc-100 font-bold">
                          Masa Open Rekrutmen
                        </span>
                      </div>
                      <div className="w-full bg-blue-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-700 dark:bg-blue-500 h-2.5 rounded-full w-1/8 transition-all duration-500 shadow-xs" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                        <span className="text-xs text-blue-950 dark:text-blue-200 font-semibold">
                          Verifikasi DPT Mahasiswa
                        </span>
                      </div>
                      <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-700">
                        1 Suara Sah
                      </span>
                    </div>
                  </div>

                  {/* Action Link in 3D Card */}
                  <div className="relative z-10 pt-2 border-t border-blue-100 dark:border-zinc-800 layer-float-sm">
                    <Link
                      href="/panduan"
                      className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-blue-50/60 dark:bg-zinc-900 hover:bg-blue-700 hover:text-white dark:hover:bg-blue-600 text-blue-950 dark:text-zinc-200 text-xs font-bold border border-blue-200/80 dark:border-zinc-800 transition-all group/btn shadow-xs"
                    >
                      <span>Cek Syarat & Ketentuan Memilih</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sambungan Gelombang Mulus Menuju Section 2 (Timeline) */}
        <div className="w-full -mb-px leading-none">
          <BgWaveDivider className="w-full text-blue-50/80 dark:text-[#0b0f19]/85" />
        </div>
      </section>

      {/* =====================================================================
          SECTION 2 (HALAMAN BARU): TIMELINE KEGIATAN KPU 2026 (GARIS PUTUS-PUTUS ZIG-ZAG)
         ===================================================================== */}
      <section className="relative flex flex-col justify-between pt-16 sm:pt-24 pb-0 bg-blue-50/80 dark:bg-[#0b0f19]/85 backdrop-blur-[1px] text-zinc-900 dark:text-zinc-100 transition-colors">
        <div className="max-w-7xl mx-auto w-full my-auto space-y-14 px-4 sm:px-6 lg:px-12">
          {/* Header Section Timeline */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-blue-200/80 dark:border-zinc-800 text-blue-800 dark:text-blue-400 text-xs font-semibold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span>Jadwal Resmi KPU 2026</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
              Timeline Kegiatan KPU 2026
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Rangkaian tanggal pelaksanaan dari pendaftaran calon hingga hari pemungutan suara Pemilihan Umum Raya Mahasiswa Politeknik LP3I.
            </p>
          </div>

          {/* GRID TIMELINE ZIG-ZAG:
              - Mobile: 2 div per baris (grid-cols-2) -> 01->02 (turun) 03<-04 (turun) 05->06 (turun) 07<-08
              - Desktop: 4 div per baris (lg:grid-cols-4) -> 01->02->03->04 (turun) 05<-06<-07<-08
          */}
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-14">
            {TIMELINE_KPU_2026.map((item) => (
              <div
                key={item.no}
                className={`relative flex flex-col ${item.orderClass}`}
              >
                {/* KARTU JADWAL TIMELINE */}
                <div className="relative z-10 h-full p-4 sm:p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-200/80 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group overflow-hidden">
                  <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-xl group-hover:bg-blue-500/25 transition-all" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-600 dark:from-blue-600 dark:to-indigo-500 text-white font-black flex items-center justify-center text-sm sm:text-base shadow-sm group-hover:scale-105 transition-transform">
                        {item.no}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.status === 'Aktif'
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : item.status === 'Puncak Acara'
                            ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-blue-700 dark:text-blue-400 tracking-wide pt-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.tanggal}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {item.judul}
                    </h3>

                    <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-blue-100/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold">Agenda #{item.no}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* CONNECTOR GARIS PUTUS-PUTUS DESKTOP (lg: 4 div per baris) */}
                {item.desktopLine === 'right' && (
                  <div
                    aria-hidden="true"
                    className="hidden lg:flex items-center absolute top-1/2 -right-10 w-10 -translate-y-1/2 z-0 pointer-events-none"
                  >
                    <div className="w-full h-[3px] dashed-line-right" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -ml-1 shadow-[0_0_8px_#3b82f6]" />
                  </div>
                )}

                {item.desktopLine === 'down' && (
                  <div
                    aria-hidden="true"
                    className="hidden lg:flex flex-col items-center absolute -bottom-14 left-1/2 h-14 -translate-x-1/2 z-0 pointer-events-none"
                  >
                    <div className="h-full w-[3px] dashed-line-down" />
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 -mt-1 shadow-[0_0_8px_#3b82f6]" />
                  </div>
                )}

                {item.desktopLine === 'left' && (
                  <div
                    aria-hidden="true"
                    className="hidden lg:flex items-center absolute top-1/2 -left-10 w-10 -translate-y-1/2 z-0 pointer-events-none"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -mr-1 z-10 shadow-[0_0_8px_#3b82f6]" />
                    <div className="w-full h-[3px] dashed-line-left" />
                  </div>
                )}

                {/* CONNECTOR GARIS PUTUS-PUTUS MOBILE (< lg: 2 div per baris) */}
                {item.mobileLine === 'right' && (
                  <div
                    aria-hidden="true"
                    className="flex lg:hidden items-center absolute top-1/2 -right-6 sm:-right-10 w-6 sm:w-10 -translate-y-1/2 z-0 pointer-events-none"
                  >
                    <div className="w-full h-[3px] dashed-line-right" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -ml-1 shadow-[0_0_8px_#3b82f6]" />
                  </div>
                )}

                {item.mobileLine === 'down' && (
                  <div
                    aria-hidden="true"
                    className="flex lg:hidden flex-col items-center absolute -bottom-10 sm:-bottom-14 left-1/2 h-10 sm:h-14 -translate-x-1/2 z-0 pointer-events-none"
                  >
                    <div className="h-full w-[3px] dashed-line-down" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -mt-1 shadow-[0_0_8px_#3b82f6]" />
                  </div>
                )}

                {item.mobileLine === 'left' && (
                  <div
                    aria-hidden="true"
                    className="flex lg:hidden items-center absolute top-1/2 -left-6 sm:-left-10 w-6 sm:w-10 -translate-y-1/2 z-0 pointer-events-none"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 -mr-1 z-10 shadow-[0_0_8px_#3b82f6]" />
                    <div className="w-full h-[3px] dashed-line-left" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sambungan Gelombang Menuju Section 3 (Tahapan Pemilihan Umum Mahasiswa) */}
        <div className="w-full -mb-px mt-16 sm:mt-20 leading-none">
          <BgWaveDivider className="w-full text-white/60 dark:text-black/60" />
        </div>
      </section>

      {/* =====================================================================
          SECTION 3 (TETAP ADA DI BAWAH TIMELINE): TAHAPAN PEMILIHAN UMUM MAHASISWA
         ===================================================================== */}
      <section className="relative flex flex-col justify-between pt-16 sm:pt-24 pb-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] text-zinc-900 dark:text-zinc-100 transition-colors">
        <div className="max-w-7xl mx-auto w-full my-auto space-y-12 px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-blue-800 dark:text-blue-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>Agenda & Tahapan</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
              Tahapan Pemilihan Umum Mahasiswa
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Seluruh rangkaian kegiatan dilaksanakan secara transparan, terstruktur, dan akuntabel demi suksesi kepemimpinan BEM LP3I yang demokratis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 space-y-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="text-base font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                Sosialisasi & Pendaftaran
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pengumuman syarat pencalonan, pendaftaran berkas pasangan calon presiden dan wakil presiden mahasiswa.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 space-y-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="text-base font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                Verifikasi & Pengundian
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pemeriksaan keabsahan berkas administrasi dan rapat pleno pengundian nomor urut pasangan calon.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 space-y-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="text-base font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                Kampanye & Debat Terbuka
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Penyampaian visi-misi, orasi gagasan, serta debat terbuka kandidat di hadapan seluruh civitas akademika LP3I.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 space-y-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                04
              </div>
              <h3 className="text-base font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                Pemungutan & Perhitungan
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pemberian hak suara di bilik TPS secara langsung dan penghitungan suara terbuka oleh panitia KPU.
              </p>
            </div>
          </div>
        </div>

        {/* Sambungan Gelombang Menuju Section 4 */}
        <div className="w-full -mb-px mt-12 sm:mt-16 leading-none">
          <BgWaveDivider className="w-full text-blue-50/80 dark:text-[#0b0f19]/85" />
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: AKSES INFORMASI & DOKUMENTASI
         ===================================================================== */}
      <section className="relative flex flex-col justify-center py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-blue-50/80 dark:bg-[#0b0f19]/85 backdrop-blur-[1px] text-zinc-900 dark:text-zinc-100">
        <div className="max-w-7xl mx-auto w-full my-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
              Eksplorasi Portal KPU Mahasiswa
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Seluruh dokumentasi kegiatan dan panduan lengkap dapat diakses dengan mudah oleh seluruh civitas akademika.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/kandidat"
              className="group p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 space-y-4 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                Profil Kandidat & Paslon
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Lihat daftar nama, latar belakang program studi, dan foto diri para kandidat calon pemimpin BEM.
              </p>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pt-2">
                <span>Buka Informasi Kandidat</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/dokumentasi"
              className="group p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 space-y-4 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                Galeri & Dokumentasi
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Cuplikan foto dan dokumentasi kegiatan sosialisasi, debat kandidat, hingga arsip Google Drive resmi KPU.
              </p>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pt-2">
                <span>Lihat Dokumentasi Kegiatan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/panduan"
              className="group p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-blue-100 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 space-y-4 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-blue-950 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                Panduan Pemilihan
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pusat petunjuk teknis, syarat pemilih, tata tertib, serta cuplikan video panduan resmi KPU.
              </p>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pt-2">
                <span>Baca Panduan Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}