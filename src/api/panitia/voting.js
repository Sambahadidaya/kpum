'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';

/**
 * Statistik Lengkap untuk Dashboard Voting Panitia
 */
export async function getVotingDashboardStats() {
  try {
    await requirePanitiaPermission();

    // 1. Ambil seluruh data paslon beserta kandidatnya
    const { data: paslonList, error: paslonErr } = await supabaseAdmin
      .from('paslon')
      .select(`
        id,
        nomor_urut,
        slogan,
        kandidat1:kandidat1_id (
          id,
          nama_kandidat,
          nim_kandidat,
          prodi_kandidat,
          fotodiri_kandidat,
          posisi
        ),
        kandidat2:kandidat2_id (
          id,
          nama_kandidat,
          nim_kandidat,
          prodi_kandidat,
          fotodiri_kandidat,
          posisi
        )
      `)
      .order('nomor_urut', { ascending: true });

    if (paslonErr) {
      return { success: false, error: paslonErr.message };
    }

    // 2. Ambil seluruh data voting
    const { data: votingList, error: voteErr } = await supabaseAdmin
      .from('voting')
      .select('id, paslon_id, created_at');

    if (voteErr) {
      return { success: false, error: voteErr.message };
    }

    // 3. Ambil total mahasiswa DPT
    const { count: totalDpt } = await supabaseAdmin
      .from('mhs')
      .select('*', { count: 'exact', head: true });

    const totalSuara = votingList?.length || 0;
    const dptCount = totalDpt || 0;
    const partisipasiPersen = dptCount > 0 ? ((totalSuara / dptCount) * 100).toFixed(1) : 0;

    // Hitung suara per paslon
    const suaraMap = {};
    (votingList || []).forEach((v) => {
      suaraMap[v.paslon_id] = (suaraMap[v.paslon_id] || 0) + 1;
    });

    const perolehanPaslon = (paslonList || []).map((p) => {
      const suara = suaraMap[p.id] || 0;
      const persen = totalSuara > 0 ? ((suara / totalSuara) * 100).toFixed(1) : 0;
      return {
        ...p,
        total_suara: suara,
        persentase: Number(persen),
      };
    });

    // Urutkan perolehan suara terbanyak
    const sortedBySuara = [...perolehanPaslon].sort((a, b) => b.total_suara - a.total_suara);
    const leadingPaslon = sortedBySuara[0] || null;

    // Tren waktu voting (kelompokkan berdasarkan tanggal/jam)
    const timelineMap = {};
    (votingList || []).forEach((v) => {
      const d = new Date(v.created_at);
      // Format jam atau tanggal ringkas
      const dateKey = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
      timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
    });

    const timelineData = Object.entries(timelineMap).map(([label, count]) => ({
      label,
      count,
    }));

    return {
      success: true,
      stats: {
        totalSuara,
        totalDpt: dptCount,
        partisipasiPersen: Number(partisipasiPersen),
        perolehanPaslon,
        leadingPaslon,
        timelineData,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Mengambil Seluruh Catatan Voting Masuk Beserta Detail Mahasiswa & Paslon Terpilih
 */
export async function getPanitiaVotingList({ search = '', paslonFilter = 'semua' } = {}) {
  try {
    await requirePanitiaPermission();

    // 1. Ambil data voting
    let query = supabaseAdmin
      .from('voting')
      .select('id, nim, paslon_id, created_at')
      .order('created_at', { ascending: false });

    if (paslonFilter !== 'semua') {
      query = query.eq('paslon_id', paslonFilter);
    }

    const { data: rawVotes, error: voteErr } = await query;
    if (voteErr) {
      return { success: false, error: voteErr.message, data: [] };
    }

    // 2. Ambil seluruh data mahasiswa
    const { data: mhsList } = await supabaseAdmin
      .from('mhs')
      .select('id, nim, nama_mhs, kode_voting');

    const mhsMap = new Map();
    (mhsList || []).forEach((m) => {
      mhsMap.set(m.id, m);
    });

    // 3. Ambil data paslon beserta kandidatnya
    const { data: paslonList } = await supabaseAdmin
      .from('paslon')
      .select(`
        id,
        nomor_urut,
        slogan,
        kandidat1:kandidat1_id (
          id,
          nama_kandidat,
          nim_kandidat,
          prodi_kandidat,
          fotodiri_kandidat,
          posisi
        ),
        kandidat2:kandidat2_id (
          id,
          nama_kandidat,
          nim_kandidat,
          prodi_kandidat,
          fotodiri_kandidat,
          posisi
        )
      `);

    const paslonMap = new Map();
    (paslonList || []).forEach((p) => {
      paslonMap.set(p.id, p);
    });

    // Gabungkan data
    let mappedList = (rawVotes || []).map((vote) => {
      const mhs = mhsMap.get(vote.nim);
      const paslon = paslonMap.get(vote.paslon_id);
      return {
        id: vote.id,
        created_at: vote.created_at,
        mhs: {
          id: mhs?.id || null,
          nama_mhs: mhs?.nama_mhs || 'Mahasiswa Tidak Diketahui',
          nim: mhs?.nim || '-',
          kode_voting: mhs?.kode_voting || '-',
        },
        paslon: paslon || null,
      };
    });

    // Filter search bila ada
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      mappedList = mappedList.filter(
        (v) =>
          v.mhs.nama_mhs.toLowerCase().includes(term) ||
          v.mhs.nim.toLowerCase().includes(term) ||
          v.mhs.kode_voting.toLowerCase().includes(term) ||
          String(v.paslon?.nomor_urut || '').includes(term)
      );
    }

    return {
      success: true,
      data: mappedList,
      totalCount: mappedList.length,
      paslonOptions: (paslonList || []).map((p) => ({
        id: p.id,
        nomor_urut: p.nomor_urut,
        label: `Paslon No. ${p.nomor_urut} - ${p.kandidat1?.nama_kandidat || ''}`,
      })),
    };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Hapus catatan voting
 */
export async function hapusVoting(id) {
  try {
    await requirePanitiaPermission();

    const { error } = await supabaseAdmin
      .from('voting')
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
