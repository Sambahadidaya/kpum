'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';

/**
 * Mengambil daftar data mahasiswa beserta status voting
 */
export async function getPanitiaMhsList({ search = '', statusFilter = 'semua' } = {}) {
  try {
    await requirePanitiaPermission();

    // 1. Ambil seluruh data mahasiswa
    let query = supabaseAdmin
      .from('mhs')
      .select('id, nim, nama_mhs, kode_voting, created_at')
      .order('created_at', { ascending: false });

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.or(`nama_mhs.ilike.${term},nim.ilike.${term},kode_voting.ilike.${term}`);
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
      return {
        ...m,
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
 * Tambah data mahasiswa secara manual
 */
export async function tambahMhsManual({ nama_mhs, nim, kode_voting }) {
  try {
    await requirePanitiaPermission();

    const cleanNama = (nama_mhs || '').trim();
    const cleanNim = (nim || '').trim();
    const cleanKode = (kode_voting || '').trim();

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
 * Tambah banyak data mahasiswa (Bulk Import dari Excel)
 */
export async function tambahMhsBulk(rows = []) {
  try {
    await requirePanitiaPermission();

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

      if (!nama || !nim) continue;

      if (seenNims.has(nim)) continue; // Hindari duplikasi internal file
      seenNims.add(nim);

      cleanedRows.push({
        nama_mhs: nama,
        nim: nim,
        // Jika kode_voting tidak ada di Excel, generate otomatis 6 digit alfanumerik
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
 * Edit data mahasiswa
 */
export async function updateMhs(id, { nama_mhs, nim, kode_voting }) {
  try {
    await requirePanitiaPermission();

    const cleanNama = (nama_mhs || '').trim();
    const cleanNim = (nim || '').trim();
    const cleanKode = (kode_voting || '').trim();

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
 * Hapus data mahasiswa
 */
export async function hapusMhs(id) {
  try {
    await requirePanitiaPermission();

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
 * Statistik Dashboard Mahasiswa
 */
export async function getMhsDashboardStats() {
  try {
    await requirePanitiaPermission();

    // 1. Ambil semua mahasiswa
    const { data: mhsList, error: mhsErr } = await supabaseAdmin
      .from('mhs')
      .select('id, nim, nama_mhs, created_at');

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
        recentVotes,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
