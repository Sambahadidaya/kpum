'use server';

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Validasi login mahasiswa untuk e-voting
 * Syarat:
 * 1. Data cocok di tabel mhs (nama_mhs, nim, kode_voting)
 * 2. Belum pernah tercatat di tabel voting
 */
export async function loginVotingMhs({ nim, kode_voting }) {
  try {
    const cleanNim = (nim || '').trim();
    const cleanKode = (kode_voting || '').trim();

    if (!cleanNim || !cleanKode) {
      return { success: false, error: 'NIM dan Kode Voting wajib diisi.' };
    }

    // 0. Keamanan Berlapis: Verifikasi jadwal voting di server (anti-cheat jam lokal & VPN)
    const { data: jadwalList, error: jadwalError } = await supabaseAdmin
      .from('jadwal_voting')
      .select('waktu_mulai, waktu_berakhir')
      .order('waktu_mulai', { ascending: false })
      .limit(1);

    if (jadwalError) {
      return { success: false, error: 'Gagal memverifikasi jadwal voting resmi.' };
    }

    if (!jadwalList || jadwalList.length === 0) {
      return {
        success: false,
        error: 'Akses ditolak: Jadwal pemungutan suara belum dibuka oleh Panitia KPU.',
        votingNotActive: true,
      };
    }

    const nowTs = Date.now();
    const startTs = new Date(jadwalList[0].waktu_mulai).getTime();
    const endTs = new Date(jadwalList[0].waktu_berakhir).getTime();

    if (nowTs < startTs) {
      return {
        success: false,
        error: 'Akses ditolak: Pemungutan suara belum dimulai. Silakan tunggu jadwal resmi dibuka.',
        votingNotActive: true,
      };
    }

    if (nowTs > endTs) {
      return {
        success: false,
        error: 'Akses ditolak: Waktu pemungutan suara telah berakhir.',
        votingNotActive: true,
      };
    }

    // 1. Cari data mahasiswa di tabel mhs berdasarkan NIM
    const { data: mhsList, error: mhsError } = await supabaseAdmin
      .from('mhs')
      .select('id, nim, nama_mhs, kode_voting')
      .eq('nim', cleanNim);

    if (mhsError) {
      return { success: false, error: 'Terjadi kesalahan sistem saat memeriksa data mahasiswa.' };
    }

    if (!mhsList || mhsList.length === 0) {
      return { success: false, error: 'Data mahasiswa dengan NIM tersebut tidak terdaftar di DPT.' };
    }

    // Cocokkan kode voting (case-insensitive)
    const mhs = mhsList.find((m) => {
      return m.kode_voting?.trim().toLowerCase() === cleanKode.toLowerCase();
    });

    if (!mhs) {
      return {
        success: false,
        error: 'Kode Voting tidak valid untuk NIM ini. Silakan periksa kembali.',
      };
    }

    // 2. Cek apakah sudah pernah voting
    const { data: existingVote, error: voteError } = await supabaseAdmin
      .from('voting')
      .select('id, created_at')
      .eq('nim', mhs.id)
      .maybeSingle();

    if (voteError && voteError.code !== 'PGRST116') {
      return { success: false, error: 'Gagal memvalidasi status hak suara mahasiswa.' };
    }

    if (existingVote) {
      return {
        success: false,
        error: 'Mahasiswa ini sudah pernah menggunakan hak suara. Tiap mahasiswa hanya dapat memilih 1 kali.',
        alreadyVoted: true,
      };
    }

    return {
      success: true,
      mhs: {
        id: mhs.id,
        nim: mhs.nim,
        nama_mhs: mhs.nama_mhs,
      },
    };
  } catch (err) {
    return { success: false, error: err.message || 'Terjadi kesalahan server.' };
  }
}

/**
 * Cek status voting mahasiswa berdasarkan mhsId
 */
export async function checkMhsVoted(mhsId) {
  try {
    if (!mhsId) return { success: false, voted: false };

    const { data, error } = await supabaseAdmin
      .from('voting')
      .select('id')
      .eq('nim', mhsId)
      .maybeSingle();

    if (error) {
      return { success: false, voted: false };
    }

    return { success: true, voted: Boolean(data) };
  } catch (err) {
    return { success: false, voted: false };
  }
}

/**
 * Submit suara pemilihan paslon
 */
export async function submitSuaraVoting({ mhsId, paslonId }) {
  try {
    if (!mhsId || !paslonId) {
      return { success: false, error: 'Data pemilih atau pasangan calon tidak valid.' };
    }

    // 0. Validasi Jadwal Voting Resmi di Server (Anti-cheat bypass jadwal)
    const { data: jadwalList, error: jadwalError } = await supabaseAdmin
      .from('jadwal_voting')
      .select('waktu_mulai, waktu_berakhir')
      .order('waktu_mulai', { ascending: false })
      .limit(1);

    if (jadwalError) {
      return { success: false, error: 'Gagal memverifikasi jadwal voting resmi di server.' };
    }

    if (!jadwalList || jadwalList.length === 0) {
      return {
        success: false,
        error: 'Pemungutan suara belum dibuka oleh Panitia KPU.',
        votingNotActive: true,
      };
    }

    const nowTs = Date.now();
    const startTs = new Date(jadwalList[0].waktu_mulai).getTime();
    const endTs = new Date(jadwalList[0].waktu_berakhir).getTime();

    if (nowTs < startTs) {
      return {
        success: false,
        error: 'Pemungutan suara belum dimulai. Silakan tunggu jadwal resmi dibuka.',
        votingNotActive: true,
      };
    }

    if (nowTs > endTs) {
      return {
        success: false,
        error: 'Waktu pemungutan suara telah berakhir. Bilik suara sudah ditutup.',
        votingNotActive: true,
      };
    }

    // 1. Verifikasi kembali apakah mahasiswa valid
    const { data: mhs, error: mhsErr } = await supabaseAdmin
      .from('mhs')
      .select('id, nama_mhs, nim')
      .eq('id', mhsId)
      .maybeSingle();

    if (mhsErr || !mhs) {
      return { success: false, error: 'Data mahasiswa tidak ditemukan.' };
    }

    // 2. Cek apakah sudah pernah voting
    const { data: alreadyVoted } = await supabaseAdmin
      .from('voting')
      .select('id')
      .eq('nim', mhsId)
      .maybeSingle();

    if (alreadyVoted) {
      return {
        success: false,
        error: 'Anda sudah pernah memberikan suara! Hak suara hanya berlaku 1 kali.',
      };
    }

    // 3. Verifikasi apakah paslon ada
    const { data: paslon, error: paslonErr } = await supabaseAdmin
      .from('paslon')
      .select('id, nomor_urut')
      .eq('id', paslonId)
      .maybeSingle();

    if (paslonErr || !paslon) {
      return { success: false, error: 'Pasangan calon yang dipilih tidak ditemukan.' };
    }

    // 4. Masukkan ke tabel voting (ingat: kolom nim diisi mhsId)
    const { error: insertErr } = await supabaseAdmin
      .from('voting')
      .insert({
        nim: mhsId,
        paslon_id: paslonId,
      });

    if (insertErr) {
      return { success: false, error: 'Gagal merekam suara: ' + insertErr.message };
    }

    return {
      success: true,
      message: 'Suara Anda berhasil direkam secara sah oleh sistem KPU Mahasiswa.',
      nomor_urut: paslon.nomor_urut,
    };
  } catch (err) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem saat voting.' };
  }
}
