'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { getPanitiaSession } from '@/utils/supabaseUtils';

/**
 * Helper validasi session panitia
 */
async function checkAuth() {
  const session = await getPanitiaSession();
  if (!session) {
    throw new Error('Akses ditolak: Anda harus login terlebih dahulu.');
  }
  return session;
}

// ==============================================================================
// 1. DATA UNTUK HALAMAN JUDUL ABSENSI
// ==============================================================================

/**
 * Mengambil data judul absensi beserta jumlah partisipasi absensi (1 GET query)
 */
export async function getJudulAbsensiData() {
  try {
    await checkAuth();

    const { data, error } = await supabaseAdmin
      .from('judul_absensi_panitia')
      .select('id, judul_absensi_panitia, created_at, absensi_panitia(id)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching judul_absensi_panitia:', error);
      return { success: false, error: error.message };
    }

    const formattedData = (data || []).map((item) => ({
      id: item.id,
      judul_absensi_panitia: item.judul_absensi_panitia,
      created_at: item.created_at,
      total_absensi: item.absensi_panitia ? item.absensi_panitia.length : 0,
    }));

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Tambah Judul Absensi baru
 */
export async function tambahJudulAbsensi(formData) {
  try {
    await checkAuth();

    const judul = (formData?.judul_absensi_panitia || '').trim();
    if (!judul) {
      return { success: false, error: 'Judul absensi wajib diisi.' };
    }

    const { data, error } = await supabaseAdmin
      .from('judul_absensi_panitia')
      .insert([
        {
          judul_absensi_panitia: judul,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Judul Absensi (Cascade menghapus absensi_panitia terkait)
 */
export async function hapusJudulAbsensi(id) {
  try {
    await checkAuth();

    if (!id) return { success: false, error: 'ID judul absensi tidak valid.' };

    const { error } = await supabaseAdmin
      .from('judul_absensi_panitia')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==============================================================================
// 2. DATA UNTUK HALAMAN ABSENSI PANITIA (1 GET query komprehensif)
// ==============================================================================

/**
 * Mengambil semua data yang dibutuhkan halaman Absensi Panitia dalam 1 panggilan:
 * - list judul absensi
 * - list semua panitia
 * - list semua catatan absensi panitia
 */
export async function getAbsensiPageData() {
  try {
    await checkAuth();

    const [judulRes, panitiaRes, absensiRes] = await Promise.all([
      supabaseAdmin
        .from('judul_absensi_panitia')
        .select('id, judul_absensi_panitia, created_at')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('panitia')
        .select('id, nama_panitia, prodi_panitia, jabatan_panitia, sub_jabatan_panitia, foto_panitia')
        .order('nama_panitia', { ascending: true }),
      supabaseAdmin
        .from('absensi_panitia')
        .select(`
          id,
          panitia_id,
          judul_absensi_panitia_id,
          jenis_absensi,
          keterlambatan,
          keterangan,
          created_at,
          panitia:panitia_id (id, nama_panitia, jabatan_panitia, prodi_panitia),
          judul_absensi_panitia:judul_absensi_panitia_id (id, judul_absensi_panitia)
        `)
        .order('created_at', { ascending: false }),
    ]);

    if (judulRes.error) throw judulRes.error;
    if (panitiaRes.error) throw panitiaRes.error;
    if (absensiRes.error) throw absensiRes.error;

    return {
      success: true,
      data: {
        judulList: judulRes.data || [],
        panitiaList: panitiaRes.data || [],
        absensiList: absensiRes.data || [],
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Tambah Catatan Absensi Panitia
 * Validasi 1 panitia hanya 1 kali absensi di judul yang sama
 */
export async function tambahAbsensi(payload) {
  try {
    await checkAuth();

    const { panitia_id, judul_absensi_panitia_id, jenis_absensi, keterlambatan, keterangan } = payload || {};

    if (!panitia_id || !judul_absensi_panitia_id || !jenis_absensi || !keterlambatan) {
      return { success: false, error: 'Data absensi tidak lengkap.' };
    }

    // Cek duplikasi di backend
    const { data: existing, error: checkErr } = await supabaseAdmin
      .from('absensi_panitia')
      .select('id')
      .eq('panitia_id', panitia_id)
      .eq('judul_absensi_panitia_id', judul_absensi_panitia_id)
      .maybeSingle();

    if (checkErr) {
      return { success: false, error: checkErr.message };
    }

    if (existing) {
      return { success: false, error: 'Panitia ini sudah melakukan absensi pada judul ini.' };
    }

    const { data, error } = await supabaseAdmin
      .from('absensi_panitia')
      .insert([
        {
          panitia_id,
          judul_absensi_panitia_id,
          jenis_absensi,
          keterlambatan,
          keterangan: keterangan?.trim() || null,
        },
      ])
      .select(`
        id,
        panitia_id,
        judul_absensi_panitia_id,
        jenis_absensi,
        keterlambatan,
        keterangan,
        created_at,
        panitia:panitia_id (id, nama_panitia, jabatan_panitia, prodi_panitia),
        judul_absensi_panitia:judul_absensi_panitia_id (id, judul_absensi_panitia)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Edit Catatan Absensi Panitia
 * HANYA boleh edit jenis_absensi, keterlambatan, dan keterangan
 */
export async function editAbsensi(id, payload) {
  try {
    await checkAuth();

    if (!id) return { success: false, error: 'ID absensi tidak valid.' };

    const { jenis_absensi, keterlambatan, keterangan } = payload || {};

    if (!jenis_absensi || !keterlambatan) {
      return { success: false, error: 'Jenis absensi dan status keterlambatan wajib diisi.' };
    }

    const { data, error } = await supabaseAdmin
      .from('absensi_panitia')
      .update({
        jenis_absensi,
        keterlambatan,
        keterangan: keterangan?.trim() || null,
      })
      .eq('id', id)
      .select(`
        id,
        panitia_id,
        judul_absensi_panitia_id,
        jenis_absensi,
        keterlambatan,
        keterangan,
        created_at,
        panitia:panitia_id (id, nama_panitia, jabatan_panitia, prodi_panitia),
        judul_absensi_panitia:judul_absensi_panitia_id (id, judul_absensi_panitia)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Catatan Absensi
 */
export async function hapusAbsensi(id) {
  try {
    await checkAuth();

    if (!id) return { success: false, error: 'ID absensi tidak valid.' };

    const { error } = await supabaseAdmin
      .from('absensi_panitia')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Menyimpan seluruh perubahan absensi panitia pada satu judul absensi (Bulk Save)
 */
export async function simpanBulkAbsensi(judulId, items = []) {
  try {
    await checkAuth();

    if (!judulId) {
      return { success: false, error: 'ID judul absensi tidak valid.' };
    }

    // 1. Ambil data absensi saat ini di DB untuk judul tersebut
    const { data: existingRows, error: fetchErr } = await supabaseAdmin
      .from('absensi_panitia')
      .select('id, panitia_id')
      .eq('judul_absensi_panitia_id', judulId);

    if (fetchErr) throw fetchErr;

    const existingMap = new Map();
    (existingRows || []).forEach((row) => {
      existingMap.set(row.panitia_id, row.id);
    });

    // 2. Pisahkan operasi: INSERT, UPDATE, DELETE
    const toInsert = [];
    const toUpdate = [];
    const toDeleteIds = [];

    for (const item of items) {
      const existingId = item.absensi_id || existingMap.get(item.panitia_id);

      if (!item.jenis_absensi || item.jenis_absensi === 'belum_absen') {
        // Jika sebelumnya ada di DB tapi sekarang di-reset ke belum_absen, hapus
        if (existingId) {
          toDeleteIds.push(existingId);
        }
      } else {
        // Jika jenis_absensi selain 'hadir', keterlambatan otomatis 'tidak hadir'
        let keterlambatanVal = 'tidak hadir';
        if (item.jenis_absensi === 'hadir') {
          keterlambatanVal = item.keterlambatan === 'terlambat' ? 'terlambat' : 'tepat_waktu';
        } else {
          keterlambatanVal = 'tidak hadir';
        }
        const keteranganVal = item.keterangan ? item.keterangan.trim() : null;

        if (existingId) {
          toUpdate.push({
            id: existingId,
            jenis_absensi: item.jenis_absensi,
            keterlambatan: keterlambatanVal,
            keterangan: keteranganVal,
          });
        } else {
          toInsert.push({
            panitia_id: item.panitia_id,
            judul_absensi_panitia_id: judulId,
            jenis_absensi: item.jenis_absensi,
            keterlambatan: keterlambatanVal,
            keterangan: keteranganVal,
          });
        }
      }
    }

    // Eksekusi DELETE jika ada
    if (toDeleteIds.length > 0) {
      const { error: delErr } = await supabaseAdmin
        .from('absensi_panitia')
        .delete()
        .in('id', toDeleteIds);
      if (delErr) throw delErr;
    }

    // Eksekusi INSERT jika ada
    if (toInsert.length > 0) {
      const { error: insErr } = await supabaseAdmin
        .from('absensi_panitia')
        .insert(toInsert);
      if (insErr) throw insErr;
    }

    // Eksekusi UPDATE jika ada
    if (toUpdate.length > 0) {
      for (const upItem of toUpdate) {
        const { error: upErr } = await supabaseAdmin
          .from('absensi_panitia')
          .update({
            jenis_absensi: upItem.jenis_absensi,
            keterlambatan: upItem.keterlambatan,
            keterangan: upItem.keterangan,
          })
          .eq('id', upItem.id);
        if (upErr) throw upErr;
      }
    }

    // 3. Ambil data terbaru untuk judul tersebut
    const { data: updatedList, error: refreshErr } = await supabaseAdmin
      .from('absensi_panitia')
      .select(`
        id,
        panitia_id,
        judul_absensi_panitia_id,
        jenis_absensi,
        keterlambatan,
        keterangan,
        created_at,
        panitia:panitia_id (id, nama_panitia, jabatan_panitia, prodi_panitia),
        judul_absensi_panitia:judul_absensi_panitia_id (id, judul_absensi_panitia)
      `)
      .eq('judul_absensi_panitia_id', judulId)
      .order('created_at', { ascending: false });

    if (refreshErr) throw refreshErr;

    return {
      success: true,
      data: updatedList || [],
    };
  } catch (error) {
    console.error('Error simpanBulkAbsensi:', error);
    return { success: false, error: error.message };
  }
}

// ==============================================================================
// 3. DATA UNTUK DASHBOARD SEKRETARIS (1 GET query komprehensif)
// ==============================================================================

/**
 * Mengambil seluruh data statistik untuk Dashboard Sekretaris dalam 1 query
 */
export async function getSekretarisDashboardData() {
  try {
    await checkAuth();

    const [judulRes, panitiaRes, absensiRes] = await Promise.all([
      supabaseAdmin
        .from('judul_absensi_panitia')
        .select('id, judul_absensi_panitia, created_at')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('panitia')
        .select('id, nama_panitia, jabatan_panitia', { count: 'exact' }),
      supabaseAdmin
        .from('absensi_panitia')
        .select(`
          id,
          panitia_id,
          judul_absensi_panitia_id,
          jenis_absensi,
          keterlambatan,
          created_at,
          judul_absensi_panitia:judul_absensi_panitia_id (id, judul_absensi_panitia)
        `)
        .order('created_at', { ascending: false }),
    ]);

    if (judulRes.error) throw judulRes.error;
    if (panitiaRes.error) throw panitiaRes.error;
    if (absensiRes.error) throw absensiRes.error;

    return {
      success: true,
      data: {
        totalPanitia: panitiaRes.count || (panitiaRes.data ? panitiaRes.data.length : 0),
        judulList: judulRes.data || [],
        absensiList: absensiRes.data || [],
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
