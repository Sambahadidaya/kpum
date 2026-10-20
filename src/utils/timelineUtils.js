/**
 * Utilitas dan Data Timeline Pemilu KPU 2026
 * Menyediakan parser tanggal, status dinamis, dan kalkulasi progress tahapan pemilu.
 */

export const TIMELINE_KPU_ITEMS = [
  {
    no: '01',
    tanggal: '17 – 20 OKTOBER 2026',
    judul: 'Open Recruitment',
    deskripsi:
      'Open Recruitment (Pendaftaran) Calon Presiden dan Wakil Presiden Mahasiswa Politeknik LP3I.',
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
    orderClass: 'order-7 lg:order-5',
    desktopLine: 'none',
    mobileLine: 'none',
  },
];

const BULAN_MAP = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

export function parseTimelineDates(tanggalStr) {
  const cleanStr = tanggalStr.replace(/[–—]/g, '-').trim();

  // Format Rentang: "17 - 19 OKTOBER 2026"
  const rangeMatch = cleanStr.match(/^(\d{1,2})\s*-\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (rangeMatch) {
    const startDay = parseInt(rangeMatch[1], 10);
    const endDay = parseInt(rangeMatch[2], 10);
    const month = BULAN_MAP[rangeMatch[3].toLowerCase()] ?? 9;
    const year = parseInt(rangeMatch[4], 10);
    return {
      startDate: new Date(year, month, startDay, 0, 0, 0),
      endDate: new Date(year, month, endDay, 23, 59, 59, 999),
    };
  }

  // Format Tanggal Tunggal: "21 OKTOBER 2026"
  const singleMatch = cleanStr.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (singleMatch) {
    const day = parseInt(singleMatch[1], 10);
    const month = BULAN_MAP[singleMatch[2].toLowerCase()] ?? 9;
    const year = parseInt(singleMatch[3], 10);
    return {
      startDate: new Date(year, month, day, 0, 0, 0),
      endDate: new Date(year, month, day, 23, 59, 59, 999),
    };
  }

  return {
    startDate: new Date(2026, 9, 1),
    endDate: new Date(2026, 10, 30),
  };
}

export function computeTimelineStatus(tanggalStr, now = new Date()) {
  const { startDate, endDate } = parseTimelineDates(tanggalStr);
  if (now < startDate) {
    return 'Mendatang';
  } else if (now > endDate) {
    return 'Selesai';
  } else {
    return 'Aktif';
  }
}

export function getActiveTimelineStage(now = new Date()) {
  const itemsWithStatus = TIMELINE_KPU_ITEMS.map((item, index) => {
    const status = computeTimelineStatus(item.tanggal, now);
    return { ...item, status, index };
  });

  // 1. Cari tahapan yang sedang 'Aktif'
  const activeItem = itemsWithStatus.find((item) => item.status === 'Aktif');
  if (activeItem) {
    const progressPercent = Math.round(((activeItem.index + 1) / itemsWithStatus.length) * 100);
    return {
      title: activeItem.judul,
      status: 'Aktif',
      progressPercent,
      itemNumber: activeItem.no,
    };
  }

  // 2. Jika tidak ada yang aktif, cari tahapan mendatang pertama
  const upcomingItem = itemsWithStatus.find((item) => item.status === 'Mendatang');
  if (upcomingItem) {
    if (upcomingItem.index === 0) {
      return {
        title: upcomingItem.judul,
        status: 'Mendatang',
        progressPercent: 12,
        itemNumber: upcomingItem.no,
      };
    }
    const progressPercent = Math.round((upcomingItem.index / itemsWithStatus.length) * 100);
    return {
      title: upcomingItem.judul,
      status: 'Menuju Tahapan',
      progressPercent,
      itemNumber: upcomingItem.no,
    };
  }

  // 3. Jika semua sudah selesai
  return {
    title: 'Pemungutan Suara Selesai',
    status: 'Selesai',
    progressPercent: 100,
    itemNumber: '08',
  };
}
