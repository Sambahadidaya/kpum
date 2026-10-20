'use server';

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Utilitas untuk mengonversi waktu UTC ke timestamp/waktu berbasis WIB (UTC+7)
 */
function getWibNow() {
  const now = new Date();
  // Timestamp UTC terkini
  return {
    serverTimestamp: now.getTime(),
    isoString: now.toISOString(),
  };
}

/**
 * Mengambil status jadwal voting saat ini untuk public / mahasiswa
 * Dilengkapi dengan validasi keamanan waktu server (anti-tamper jam client)
 */
export async function getStatusJadwalVoting() {
  try {
    // Ambil jadwal voting terbaru dari tabel jadwal_voting
    const { data: jadwalList, error } = await supabaseAdmin
      .from('jadwal_voting')
      .select('id, waktu_mulai, waktu_berakhir, created_at')
      .order('waktu_mulai', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching jadwal voting:', error);
      return {
        success: false,
        error: error.message,
        status: 'error',
      };
    }

    const { serverTimestamp } = getWibNow();

    if (!jadwalList || jadwalList.length === 0) {
      return {
        success: true,
        hasJadwal: false,
        status: 'tidak_ada_jadwal',
        serverTime: serverTimestamp,
        message: 'Jadwal pemungutan suara belum ditentukan oleh panitia KPU.',
      };
    }

    const jadwal = jadwalList[0];
    const waktuMulaiTs = new Date(jadwal.waktu_mulai).getTime();
    const waktuBerakhirTs = new Date(jadwal.waktu_berakhir).getTime();

    let status = 'berlangsung';
    let sisaWaktuDetik = 0;
    let message = 'Pemungutan suara sedang berlangsung.';

    if (serverTimestamp < waktuMulaiTs) {
      status = 'belum_dimulai';
      sisaWaktuDetik = Math.max(0, Math.floor((waktuMulaiTs - serverTimestamp) / 1000));
      message = 'Pemungutan suara belum dimulai. Silakan tunggu jadwal resmi dibuka.';
    } else if (serverTimestamp > waktuBerakhirTs) {
      status = 'selesai';
      sisaWaktuDetik = 0;
      message = 'Waktu pemungutan suara telah berakhir.';
    } else {
      status = 'berlangsung';
      sisaWaktuDetik = Math.max(0, Math.floor((waktuBerakhirTs - serverTimestamp) / 1000));
      message = 'Bilik suara dibuka. Silakan masukkan NIM dan Kode Voting Anda.';
    }

    return {
      success: true,
      hasJadwal: true,
      status, // 'belum_dimulai' | 'berlangsung' | 'selesai'
      jadwalId: jadwal.id,
      waktuMulai: jadwal.waktu_mulai,
      waktuBerakhir: jadwal.waktu_berakhir,
      serverTime: serverTimestamp,
      sisaWaktuDetik,
      message,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat mengecek jadwal voting.',
      status: 'error',
    };
  }
}
