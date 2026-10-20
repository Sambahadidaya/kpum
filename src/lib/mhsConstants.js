// Konstanta dan helper NIM untuk fitur Mahasiswa
// Dipindahkan ke sini agar tidak bertabrakan dengan 'use server' di mhs.js

export const VALID_KELAS = ['Reg', 'NonReg', 'Manaj', 'Dosen'];

export const PRODI_MAP = {
  '01': 'Administrasi Bisnis',
  '02': 'Manajemen Informatika',
  '03': 'Akuntansi',
  '04': 'Hubungan Masyarakat',
  '41': 'Bisnis Digital',
  '42': 'Akuntansi Perpajakan',
};

/**
 * Helper untuk parsing angkatan dan prodi dari NIM berdasarkan kelas
 * @param {string} nim
 * @param {string} kelas
 * @returns {{ angkatan: string, prodi: string, kodeProdi: string }}
 */
export function parseNimHelper(nim, kelas) {
  const cleanNim = String(nim || '').trim();
  const cleanKelas = String(kelas || 'Reg').trim();

  if (cleanKelas !== 'Reg' && cleanKelas !== 'NonReg') {
    return {
      angkatan: cleanKelas || '-',
      prodi: cleanKelas || '-',
      kodeProdi: '',
    };
  }

  const angkatan = cleanNim.length >= 4 ? cleanNim.substring(0, 4) : '-';
  const kodeProdi = cleanNim.length >= 6 ? cleanNim.substring(4, 6) : '';
  const prodi = PRODI_MAP[kodeProdi] || (kodeProdi ? `Prodi (${kodeProdi})` : '-');

  return {
    angkatan,
    prodi,
    kodeProdi,
  };
}
