// Role constants dan permission map untuk Admin Panitia KPU

export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN_PANITIA: 'adminPanitia',
};

export const AVAILABLE_PERMISSIONS = [
  // Dashboard & Trafik
  {
    id: 'dashboard',
    label: 'Dashboard Utama',
    category: 'Dashboard & Trafik',
    desc: 'Akses halaman ringkasan dan statistik utama sistem',
  },
  {
    id: 'trafik',
    label: 'Manajemen Trafik',
    category: 'Dashboard & Trafik',
    desc: 'Pemantauan log pengunjung dan pengaturan retensi pembersihan trafik',
  },

  // Kandidat & Paslon
  {
    id: 'kandidat',
    label: 'Manajemen Kandidat',
    category: 'Kandidat & Paslon',
    desc: 'Kelola data diri, berkas persyaratan, dan eliminasi kandidat',
  },
  {
    id: 'paslon',
    label: 'Manajemen Paslon',
    category: 'Kandidat & Paslon',
    desc: 'Kelola pasangan calon, nomor urut, slogan, dan visi-misi',
  },

  // Data Mahasiswa (DPT)
  {
    id: 'mhs',
    label: 'Data Mahasiswa & DPT',
    category: 'Data Mahasiswa (DPT)',
    desc: 'Kelola data DPT pemilih, import CSV, dan token kode voting',
  },

  // E-Voting
  {
    id: 'voting',
    label: 'E-Voting & Rekap Suara',
    category: 'E-Voting',
    desc: 'Pemantauan live suara masuk, grafik hasil, dan audit log voting',
  },

  // Data Panitia & Sosmed
  {
    id: 'panitia',
    label: 'Struktur Organisasi Panitia',
    category: 'Kepanitiaan',
    desc: 'Kelola anggota panitia, prodi, dan jabatan KPU',
  },
  {
    id: 'trafik_sosmed',
    label: 'Trafik Sosial Media',
    category: 'Kepanitiaan',
    desc: 'Pemantauan klik tautan sosial media panitia (IG, WA, TikTok)',
  },

  // Sekretaris & Absensi
  {
    id: 'sekretaris',
    label: 'Sekretariat & Absensi Panitia',
    category: 'Sekretariat & Absensi',
    desc: 'Kelola absensi rapat panitia, agenda kegiatan, dan rekapitulasi kehadiran',
  },

  // Informasi & Publikasi
  {
    id: 'dokumentasi',
    label: 'Dokumentasi Galeri & Drive',
    category: 'Informasi & Publikasi',
    desc: 'Kelola album foto dokumentasi dan tautan Google Drive',
  },
  {
    id: 'jadwal',
    label: 'Jadwal Acara Pemilu',
    category: 'Informasi & Publikasi',
    desc: 'Kelola timeline kegiatan, tanggal penting, dan lokasi acara',
  },
  {
    id: 'panduan',
    label: 'Panduan Pemilu',
    category: 'Informasi & Publikasi',
    desc: 'Kelola artikel panduan pemilih dan video tutorial YouTube',
  },
  {
    id: 'contact',
    label: 'Pesan Kontak & Aspirasi',
    category: 'Informasi & Publikasi',
    desc: 'Melihat dan menindaklanjuti pesan kontak atau pengaduan masuk',
  },

  // Pengaturan Khusus SuperAdmin
  {
    id: 'akun',
    label: 'Manajemen Akun Panitia',
    category: 'Pengaturan Khusus (SuperAdmin)',
    desc: 'Pendaftaran akun baru panitia dan pengaturan hak akses',
    superAdminOnly: true,
  },
  {
    id: 'roleakses',
    label: 'Manajemen Role Akses',
    category: 'Pengaturan Khusus (SuperAdmin)',
    desc: 'Pembuatan role dan konfigurasi izin modul sistem',
    superAdminOnly: true,
  },
];

export const ROLE_PERMISSIONS = {
  superAdmin: [
    'all',
    'dashboard',
    'trafik',
    'kandidat',
    'paslon',
    'mhs',
    'voting',
    'panitia',
    'trafik_sosmed',
    'sekretaris',
    'dokumentasi',
    'jadwal',
    'panduan',
    'contact',
    'akun',
    'roleakses',
  ],
  adminPanitia: [
    'dashboard',
    'trafik',
    'kandidat',
    'paslon',
    'mhs',
    'voting',
    'panitia',
    'trafik_sosmed',
    'sekretaris',
    'dokumentasi',
    'jadwal',
    'panduan',
    'contact',
  ],
};

export function hasPermission(roleName, requiredPermission, roleAkses = null) {
  if (!roleName) return false;
  if (roleName === ROLES.SUPER_ADMIN || roleName === 'superAdmin') return true;

  // Cek permissions dinamis dari string roleAkses di tabel roleadmin
  if (roleAkses) {
    if (roleAkses === 'all' || roleAkses.includes('all')) return true;
    const perms = roleAkses.split(',').map((p) => p.trim());
    if (perms.includes(requiredPermission)) return true;

    // Kompatibilitas alias izin modul turunan
    if (requiredPermission === 'paslon' && perms.includes('kandidat')) return true;
    if (requiredPermission === 'trafik' && perms.includes('dashboard')) return true;
    if (requiredPermission === 'jadwal' && perms.includes('dokumentasi')) return true;
    if (requiredPermission === 'trafik_sosmed' && perms.includes('panitia')) return true;
  }

  // Fallback ke permission statis berdasarkan roleName
  const permissions = ROLE_PERMISSIONS[roleName] || [];
  return permissions.includes(requiredPermission);
}
