'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission, requirePanitiaEditor } from '@/utils/supabaseUtils';
import { VALID_KELAS, PRODI_MAP } from '@/lib/mhsConstants';

/**
 * Mengambil daftar data mahasiswa beserta status voting dan kolom kelas
 */
export async function getPanitiaMhsList({ search = '', statusFilter = 'semua', kelasFilter = 'semua' } = {}) {
  try {
    await requirePanitiaPermission('mhs');

    // 1. Ambil seluruh data mahasiswa termasuk kolom kelas
    let query = supabaseAdmin
      .from('mhs')
      .select('id, nim, nama_mhs, kode_voting, kelas, created_at')
      .order('created_at', { ascending: false });

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.or(`nama_mhs.ilike.${term},nim.ilike.${term},kode_voting.ilike.${term}`);
    }

    if (kelasFilter && kelasFilter !== 'semua') {
      query = query.eq('kelas', kelasFilter);
    }

    const { data: mhsList, error: mhsErr } = await query;
    if (mhsErr) {
      return { success: false, error: mhsErr.message, data: [] };
    }

    // 2. Ambil data voting untuk mencocokkan status
    const { data: votingList, error: voteErr } = await supabaseAdmin
      .from('voting')
      .select('id, nim, created_at, paslon_id');

    if (voteErr) {
      return { success: false, error: voteErr.message, data: [] };
    }

    // Mapping status voting
    const voteMap = new Map();
    (votingList || []).forEach((v) => {
      voteMap.set(v.nim, v);
    });

    let mappedData = (mhsList || []).map((m) => {
      const voteRecord = voteMap.get(m.id);
      const parsed = (() => {
        const cleanNim = String(m.nim || '').trim();
        const cleanKelas = String(m.kelas || 'Reg').trim();
        if (cleanKelas !== 'Reg' && cleanKelas !== 'NonReg') {
          return {
            angkatan: cleanKelas || '-',
            prodi: cleanKelas || '-',
          };
        }
        const angkatan = cleanNim.length >= 4 ? cleanNim.substring(0, 4) : '-';
        const kode = cleanNim.length >= 6 ? cleanNim.substring(4, 6) : '';
        const prodi = PRODI_MAP[kode] || (kode ? `Prodi (${kode})` : '-');
        return { angkatan, prodi };
      })();

      return {
        ...m,
        kelas: m.kelas || 'Reg',
        angkatan: parsed.angkatan,
        prodi: parsed.prodi,
        has_voted: Boolean(voteRecord),
        voting_at: voteRecord ? voteRecord.created_at : null,
        voting_id: voteRecord ? voteRecord.id : null,
      };
    });

    if (statusFilter === 'sudah') {
      mappedData = mappedData.filter((m) => m.has_voted);
    } else if (statusFilter === 'belum') {
      mappedData = mappedData.filter((m) => !m.has_voted);
    }

    return {
      success: true,
      data: mappedData,
      totalCount: mhsList?.length || 0,
      votedCount: mappedData.filter((m) => m.has_voted).length,
    };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Tambah data mahasiswa secara manual (Khusus Editor)
 */
export async function tambahMhsManual({ nama_mhs, nim, kode_voting, kelas = 'Reg' }) {
  try {
    await requirePanitiaEditor('mhs');

    const cleanNama = (nama_mhs || '').trim();
    const cleanNim = (nim || '').trim();
    const cleanKode = (kode_voting || '').trim();
    const cleanKelas = VALID_KELAS.includes(kelas) ? kelas : 'Reg';

    if (!cleanNama || !cleanNim || !cleanKode) {
      return { success: false, error: 'Semua kolom (Nama, NIM, Kode Voting) wajib diisi.' };
    }

    // Cek apakah NIM sudah terdaftar
    const { data: exist } = await supabaseAdmin
      .from('mhs')
      .select('id')
      .eq('nim', cleanNim)
      .maybeSingle();

    if (exist) {
      return { success: false, error: `Mahasiswa dengan NIM ${cleanNim} sudah terdaftar di sistem.` };
    }

    const { data, error } = await supabaseAdmin
      .from('mhs')
      .insert({
        nama_mhs: cleanNama,
        nim: cleanNim,
        kode_voting: cleanKode,
        kelas: cleanKelas,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Tambah banyak data mahasiswa (Bulk Import dari Excel) (Khusus Editor)
 */
export async function tambahMhsBulk(rows = []) {
  try {
    await requirePanitiaEditor('mhs');

    if (!rows || rows.length === 0) {
      return { success: false, error: 'Tidak ada data mahasiswa yang dikirim untuk diimpor.' };
    }

    // Bersihkan dan validasi baris
    const cleanedRows = [];
    const seenNims = new Set();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const nama = (r.nama_mhs || r.nama || r.Nama || '').toString().trim();
      const nim = (r.nim || r.NIM || r.Nim || '').toString().trim();
      const kode = (r.kode_voting || r.kode || r.Kode || r.token || '').toString().trim();
      
      const rawKelas = (r.kelas || r.Kelas || r.KELAS || 'Reg').toString().trim();
      const cleanKelas = VALID_KELAS.includes(rawKelas) ? rawKelas : 'Reg';

      if (!nama || !nim) continue;

      if (seenNims.has(nim)) continue;
      seenNims.add(nim);

      cleanedRows.push({
        nama_mhs: nama,
        nim: nim,
        kelas: cleanKelas,
        kode_voting: kode || Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
    }

    if (cleanedRows.length === 0) {
      return {
        success: false,
        error: 'Format data file tidak sesuai. Pastikan ada kolom nama dan nim.',
      };
    }

    // Dapatkan NIM yang sudah ada di database untuk mencegah error duplicate
    const { data: existingMhs } = await supabaseAdmin
      .from('mhs')
      .select('nim');

    const dbNimSet = new Set((existingMhs || []).map((m) => m.nim));
    const toInsert = cleanedRows.filter((item) => !dbNimSet.has(item.nim));

    if (toInsert.length === 0) {
      return {
        success: false,
        error: 'Semua mahasiswa dalam file Excel sudah terdaftar di sistem sebelumnya.',
      };
    }

    // Insert dalam batch per 100 baris
    const BATCH_SIZE = 100;
    let insertedTotal = 0;

    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const chunk = toInsert.slice(i, i + BATCH_SIZE);
      const { error: batchErr } = await supabaseAdmin.from('mhs').insert(chunk);
      if (batchErr) {
        return {
          success: false,
          error: `Gagal mengimpor batch pada indeks ${i}: ${batchErr.message}`,
        };
      }
      insertedTotal += chunk.length;
    }

    return {
      success: true,
      insertedCount: insertedTotal,
      skippedCount: cleanedRows.length - toInsert.length,
      totalRead: cleanedRows.length,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Edit data mahasiswa (Khusus Editor)
 */
export async function updateMhs(id, { nama_mhs, nim, kode_voting, kelas = 'Reg' }) {
  try {
    await requirePanitiaEditor('mhs');

    const cleanNama = (nama_mhs || '').trim();
    const cleanNim = (nim || '').trim();
    const cleanKode = (kode_voting || '').trim();
    const cleanKelas = VALID_KELAS.includes(kelas) ? kelas : 'Reg';

    if (!cleanNama || !cleanNim || !cleanKode) {
      return { success: false, error: 'Semua kolom wajib diisi.' };
    }

    // Cek duplikasi NIM mahasiswa lain
    const { data: exist } = await supabaseAdmin
      .from('mhs')
      .select('id')
      .eq('nim', cleanNim)
      .neq('id', id)
      .maybeSingle();

    if (exist) {
      return { success: false, error: `NIM ${cleanNim} sudah digunakan oleh mahasiswa lain.` };
    }

    const { data, error } = await supabaseAdmin
      .from('mhs')
      .update({
        nama_mhs: cleanNama,
        nim: cleanNim,
        kode_voting: cleanKode,
        kelas: cleanKelas,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Hapus data mahasiswa (Khusus Editor)
 */
export async function hapusMhs(id) {
  try {
    await requirePanitiaEditor('mhs');

    const { error } = await supabaseAdmin
      .from('mhs')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Statistik Lengkap Dashboard Mahasiswa dengan Breakdown Baru
 */
export async function getMhsDashboardStats() {
  try {
    await requirePanitiaPermission('mhs');

    // 1. Ambil semua mahasiswa termasuk kolom kelas
    const { data: mhsList, error: mhsErr } = await supabaseAdmin
      .from('mhs')
      .select('id, nim, nama_mhs, kelas, created_at');

    if (mhsErr) {
      return { success: false, error: mhsErr.message };
    }

    // 2. Ambil data voting
    const { data: votingList, error: voteErr } = await supabaseAdmin
      .from('voting')
      .select('id, nim, created_at, paslon_id');

    if (voteErr) {
      return { success: false, error: voteErr.message };
    }

    const totalMhs = mhsList?.length || 0;
    const voteMap = new Map();
    (votingList || []).forEach((v) => {
      voteMap.set(v.nim, v);
    });

    const sudahVotingCount = (votingList || []).length;
    const belumVotingCount = Math.max(0, totalMhs - sudahVotingCount);
    const persentase = totalMhs > 0 ? ((sudahVotingCount / totalMhs) * 100).toFixed(1) : 0;

    // Inisialisasi struktur analisis
    const kelasStats = {
      Reg: { total: 0, sudah: 0, belum: 0 },
      NonReg: { total: 0, sudah: 0, belum: 0 },
      Manaj: { total: 0, sudah: 0, belum: 0 },
      Dosen: { total: 0, sudah: 0, belum: 0 },
    };

    const angkatanStats = {};
    const prodiStats = {};

    (mhsList || []).forEach((m) => {
      const hasVoted = voteMap.has(m.id);
      const k = VALID_KELAS.includes(m.kelas) ? m.kelas : 'Reg';

      // Hitung per kelas
      kelasStats[k].total += 1;
      if (hasVoted) {
        kelasStats[k].sudah += 1;
      } else {
        kelasStats[k].belum += 1;
      }

      // Hitung angkatan & prodi
      let angkatanKey = k;
      let prodiKey = k;

      if (k === 'Reg' || k === 'NonReg') {
        const cleanNim = String(m.nim || '').trim();
        angkatanKey = cleanNim.length >= 4 ? cleanNim.substring(0, 4) : 'Lainnya';
        const kode = cleanNim.length >= 6 ? cleanNim.substring(4, 6) : '';
        prodiKey = PRODI_MAP[kode] || (kode ? `Prodi ${kode}` : 'Lainnya');
      }

      // Angkatan
      if (!angkatanStats[angkatanKey]) {
        angkatanStats[angkatanKey] = { total: 0, sudah: 0, belum: 0 };
      }
      angkatanStats[angkatanKey].total += 1;
      if (hasVoted) angkatanStats[angkatanKey].sudah += 1;
      else angkatanStats[angkatanKey].belum += 1;

      // Prodi
      if (!prodiStats[prodiKey]) {
        prodiStats[prodiKey] = { total: 0, sudah: 0, belum: 0 };
      }
      prodiStats[prodiKey].total += 1;
      if (hasVoted) prodiStats[prodiKey].sudah += 1;
      else prodiStats[prodiKey].belum += 1;
    });

    // Riwayat voting terkini
    const recentVotes = (votingList || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map((v) => {
        const m = (mhsList || []).find((mhs) => mhs.id === v.nim);
        return {
          id: v.id,
          nama_mhs: m ? m.nama_mhs : 'Mahasiswa',
          nim: m ? m.nim : '-',
          kelas: m ? m.kelas : 'Reg',
          created_at: v.created_at,
        };
      });

    return {
      success: true,
      stats: {
        totalMhs,
        sudahVoting: sudahVotingCount,
        belumVoting: belumVotingCount,
        persentase: Number(persentase),
        kelasStats,
        angkatanStats,
        prodiStats,
        recentVotes,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
