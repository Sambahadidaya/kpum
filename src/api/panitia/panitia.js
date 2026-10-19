'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';
import { sanitizeText, sanitizeUrl } from '@/scurity/sanitaze';
import { deleteFotoPanitia } from '@/api/storage';

/**
 * Mengambil seluruh data panitia untuk panel admin panitia
 */
export async function getPanitiaList() {
  try {
    await requirePanitiaPermission('panitia');

    const { data, error } = await supabaseAdmin
      .from('panitia')
      .select(`
        id,
        nama_panitia,
        prodi_panitia,
        jabatan_panitia,
        sub_jabatan_panitia,
        foto_panitia,
        bg_image,
        urutan,
        created_at,
        sosmed_panitia (
          id,
          panitia_id,
          whatsapp,
          instagram,
          threads,
          tiktok
        )
      `)
      .order('urutan', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Tambah atau Perbarui Data Panitia
 */
export async function simpanPanitia(payload) {
  try {
    await requirePanitiaPermission('panitia');

    const id = payload.id;
    const nama = sanitizeText(payload.nama_panitia || '');
    const prodi = sanitizeText(payload.prodi_panitia || '');
    const jabatan = sanitizeText(payload.jabatan_panitia || '');
    const subJabatan = sanitizeText(payload.sub_jabatan_panitia || '');
    const foto = sanitizeUrl(payload.foto_panitia || '');
    const bgImage = sanitizeUrl(payload.bg_image || '');
    const urutan = payload.urutan !== undefined && payload.urutan !== null && payload.urutan !== ''
      ? parseInt(payload.urutan, 10)
      : 1;

    // Data sosial media panitia
    const sosmed = payload.sosmed || {};
    const whatsapp = sanitizeText(sosmed.whatsapp || '');
    const instagram = sanitizeText(sosmed.instagram || '');
    const threads = sanitizeText(sosmed.threads || '');
    const tiktok = sanitizeText(sosmed.tiktok || '');

    if (!nama || !prodi || !jabatan) {
      return { success: false, error: 'Nama, Program Studi, dan Jabatan wajib diisi.' };
    }

    let panitiaId = id;

    if (id) {
      // Edit
      const { error } = await supabaseAdmin
        .from('panitia')
        .update({
          nama_panitia: nama,
          prodi_panitia: prodi,
          jabatan_panitia: jabatan,
          sub_jabatan_panitia: subJabatan || null,
          foto_panitia: foto || null,
          bg_image: bgImage || null,
          urutan: isNaN(urutan) ? 1 : urutan,
        })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
    } else {
      // Tambah baru
      const { data: inserted, error } = await supabaseAdmin
        .from('panitia')
        .insert({
          nama_panitia: nama,
          prodi_panitia: prodi,
          jabatan_panitia: jabatan,
          sub_jabatan_panitia: subJabatan || null,
          foto_panitia: foto || null,
          bg_image: bgImage || null,
          urutan: isNaN(urutan) ? 1 : urutan,
        })
        .select('id')
        .single();

      if (error) return { success: false, error: error.message };
      panitiaId = inserted?.id;
    }

    // Kelola data sosmed_panitia
    if (panitiaId) {
      const { data: existingSosmed } = await supabaseAdmin
        .from('sosmed_panitia')
        .select('id')
        .eq('panitia_id', panitiaId)
        .maybeSingle();

      if (existingSosmed) {
        await supabaseAdmin
          .from('sosmed_panitia')
          .update({
            whatsapp: whatsapp || null,
            instagram: instagram || null,
            threads: threads || null,
            tiktok: tiktok || null,
          })
          .eq('panitia_id', panitiaId);
      } else if (whatsapp || instagram || threads || tiktok) {
        await supabaseAdmin
          .from('sosmed_panitia')
          .insert({
            panitia_id: panitiaId,
            whatsapp: whatsapp || null,
            instagram: instagram || null,
            threads: threads || null,
            tiktok: tiktok || null,
          });
      }
    }

    return { success: true, message: 'Data panitia berhasil disimpan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Panitia beserta foto dan background di storage
 */
export async function hapusPanitia(id, fotoUrl, bgUrl) {
  try {
    await requirePanitiaPermission('panitia');

    if (!id) return { success: false, error: 'ID panitia tidak valid.' };

    // Hapus foto di storage bila ada
    if (fotoUrl) {
      await deleteFotoPanitia(fotoUrl);
    }

    // Hapus gambar background di storage bila ada
    if (bgUrl) {
      await deleteFotoPanitia(bgUrl);
    }

    const { error } = await supabaseAdmin.from('panitia').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Data panitia berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * ==============================================================================
 * ANALITIK & MANAJEMEN TRAFIK SOSMED PANITIA
 * ==============================================================================
 */

/**
 * Mengambil data analitik lengkap dan log riwayat trafik klik sosmed panitia
 * Menggunakan 1 query database tunggal yang diolah kembali secara mendalam
 */
export async function getPanitiaTrafikSosmedData(filterDate = null) {
  try {
    await requirePanitiaPermission('panitia');

    // 1 QUERY DATABASE TUNGGAL: Ambil data panitia beserta sosmed dan riwayat trafik
    let panitiaList = [];
    let querySuccess = false;

    // 1. Coba query relasi bertingkat dengan kolom platform
    let { data: primaryData, error: primaryError } = await supabaseAdmin
      .from('panitia')
      .select(`
        id,
        nama_panitia,
        prodi_panitia,
        jabatan_panitia,
        sub_jabatan_panitia,
        foto_panitia,
        bg_image,
        urutan,
        created_at,
        sosmed_panitia (
          id,
          whatsapp,
          instagram,
          threads,
          tiktok,
          trafik_sosmed (
            id,
            platform,
            created_at
          )
        )
      `)
      .order('urutan', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    // Jika error karena kolom platform belum ada di tabel trafik_sosmed, fallback select tanpa platform
    if (primaryError && primaryError.message && primaryError.message.includes('platform')) {
      const retry = await supabaseAdmin
        .from('panitia')
        .select(`
          id,
          nama_panitia,
          prodi_panitia,
          jabatan_panitia,
          sub_jabatan_panitia,
          foto_panitia,
          bg_image,
          urutan,
          created_at,
          sosmed_panitia (
            id,
            whatsapp,
            instagram,
            threads,
            tiktok,
            trafik_sosmed (
              id,
              created_at
            )
          )
        `)
        .order('urutan', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      primaryData = retry.data;
      primaryError = retry.error;
    }

    if (!primaryError && primaryData) {
      panitiaList = primaryData;
      querySuccess = true;
    } else {
      // Fallback 1 query jika relasi bertingkat 2 level memerlukan query dari tabel trafik_sosmed
      let { data: fallbackLogs, error: fbError } = await supabaseAdmin
        .from('trafik_sosmed')
        .select(`
          id,
          platform,
          created_at,
          sosmed_id,
          sosmed_panitia (
            id,
            panitia_id,
            whatsapp,
            instagram,
            threads,
            tiktok,
            panitia (
              id,
              nama_panitia,
              prodi_panitia,
              jabatan_panitia,
              sub_jabatan_panitia,
              foto_panitia
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (fbError && fbError.message && fbError.message.includes('platform')) {
        const retryFb = await supabaseAdmin
          .from('trafik_sosmed')
          .select(`
            id,
            created_at,
            sosmed_id,
            sosmed_panitia (
              id,
              panitia_id,
              whatsapp,
              instagram,
              threads,
              tiktok,
              panitia (
                id,
                nama_panitia,
                prodi_panitia,
                jabatan_panitia,
                sub_jabatan_panitia,
                foto_panitia
              )
            )
          `)
          .order('created_at', { ascending: false });

        fallbackLogs = retryFb.data;
        fbError = retryFb.error;
      }

      if (fbError) {
        return { success: false, data: [], analisisPanitia: [], summary: null, error: fbError.message };
      }

      // Olah fallbackData menjadi format panitiaList
      const mapFromLogs = {};
      (fallbackLogs || []).forEach((log) => {
        const p = log.sosmed_panitia?.panitia;
        if (!p) return;
        if (!mapFromLogs[p.id]) {
          mapFromLogs[p.id] = {
            id: p.id,
            nama_panitia: p.nama_panitia,
            prodi_panitia: p.prodi_panitia,
            jabatan_panitia: p.jabatan_panitia,
            sub_jabatan_panitia: p.sub_jabatan_panitia,
            foto_panitia: p.foto_panitia,
            sosmed_panitia: [
              {
                id: log.sosmed_panitia?.id,
                whatsapp: log.sosmed_panitia?.whatsapp,
                instagram: log.sosmed_panitia?.instagram,
                threads: log.sosmed_panitia?.threads,
                tiktok: log.sosmed_panitia?.tiktok,
                trafik_sosmed: [],
              },
            ],
          };
        }
        mapFromLogs[p.id].sosmed_panitia[0].trafik_sosmed.push({
          id: log.id,
          platform: log.platform || null,
          created_at: log.created_at,
        });
      });
      panitiaList = Object.values(mapFromLogs);
      querySuccess = true;
    }

    // ==============================================================================
    // PENGOLAHAN KEMBALI HASIL QUERY MENJADI ANALISIS LENGKAP
    // ==============================================================================

    const allLogs = [];
    const dailyMap = {};
    let totalAllClicks = 0;

    // Olah tiap panitia beserta akun sosmed dan jumlah klik masing-masing
    let totalWA = 0;
    let totalIG = 0;
    let totalTikTok = 0;
    let totalThreads = 0;

    const analisisPanitia = (panitiaList || []).map((p) => {
      const sosmedItem = Array.isArray(p.sosmed_panitia) && p.sosmed_panitia.length > 0
        ? p.sosmed_panitia[0]
        : (p.sosmed_panitia || {});

      const clickLogs = Array.isArray(sosmedItem?.trafik_sosmed) ? sosmedItem.trafik_sosmed : [];
      const totalClicks = clickLogs.length;
      totalAllClicks += totalClicks;

      const clicksPerPlatform = {
        whatsapp: 0,
        instagram: 0,
        tiktok: 0,
        threads: 0,
        lainnya: 0,
      };

      // Catat waktu klik terakhir
      let lastClicked = null;
      clickLogs.forEach((c) => {
        if (!lastClicked || new Date(c.created_at) > new Date(lastClicked)) {
          lastClicked = c.created_at;
        }

        const plat = (c.platform || '').toLowerCase().trim();
        if (plat === 'whatsapp' || plat === 'wa') {
          clicksPerPlatform.whatsapp += 1;
          totalWA += 1;
        } else if (plat === 'instagram' || plat === 'ig') {
          clicksPerPlatform.instagram += 1;
          totalIG += 1;
        } else if (plat === 'tiktok') {
          clicksPerPlatform.tiktok += 1;
          totalTikTok += 1;
        } else if (plat === 'threads') {
          clicksPerPlatform.threads += 1;
          totalThreads += 1;
        } else {
          // Jika belum ada tag platform spesifik (data historis sebelum kolom platform)
          clicksPerPlatform.lainnya += 1;
        }

        // Kumpulkan ke log global
        allLogs.push({
          id: c.id,
          platform: c.platform || null,
          created_at: c.created_at,
          panitia: {
            id: p.id,
            nama_panitia: p.nama_panitia,
            prodi_panitia: p.prodi_panitia,
            jabatan_panitia: p.jabatan_panitia,
            sub_jabatan_panitia: p.sub_jabatan_panitia,
            foto_panitia: p.foto_panitia,
          },
          sosmed: {
            whatsapp: sosmedItem?.whatsapp || null,
            instagram: sosmedItem?.instagram || null,
            threads: sosmedItem?.threads || null,
            tiktok: sosmedItem?.tiktok || null,
          },
        });

        // Hitung tren harian (YYYY-MM-DD)
        if (c.created_at) {
          const dateKey = new Date(c.created_at).toISOString().split('T')[0];
          dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1;
        }
      });

      // Hitung akun yang tersedia
      const akunTersedia = [];
      if (sosmedItem?.whatsapp) akunTersedia.push('whatsapp');
      if (sosmedItem?.instagram) akunTersedia.push('instagram');
      if (sosmedItem?.threads) akunTersedia.push('threads');
      if (sosmedItem?.tiktok) akunTersedia.push('tiktok');

      return {
        id: p.id,
        nama: p.nama_panitia,
        prodi: p.prodi_panitia,
        jabatan: p.jabatan_panitia,
        subJabatan: p.sub_jabatan_panitia,
        foto: p.foto_panitia,
        sosmed: {
          whatsapp: sosmedItem?.whatsapp || null,
          instagram: sosmedItem?.instagram || null,
          threads: sosmedItem?.threads || null,
          tiktok: sosmedItem?.tiktok || null,
        },
        akunTersedia,
        totalAkun: akunTersedia.length,
        totalClicks,
        clicksPerPlatform,
        lastClicked,
      };
    });

    // Urutkan analisis panitia berdasarkan totalClicks terbanyak (Ranking)
    analisisPanitia.sort((a, b) => b.totalClicks - a.totalClicks);

    // Tambahkan persentase dan ranking status
    const rataRataKlik = analisisPanitia.length > 0 ? (totalAllClicks / analisisPanitia.length) : 0;
    analisisPanitia.forEach((item, index) => {
      item.ranking = index + 1;
      item.persentase = totalAllClicks > 0 ? ((item.totalClicks / totalAllClicks) * 100).toFixed(1) : 0;
      if (item.totalClicks === 0) {
        item.status = 'Belum Ada Klik';
      } else if (item.totalClicks >= rataRataKlik) {
        item.status = 'Tinggi';
      } else {
        item.status = 'Aktif';
      }
    });

    // Urutkan seluruh logs dari yang terbaru
    allLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Filter logs jika user memberikan filterDate
    let filteredLogs = allLogs;
    if (filterDate) {
      filteredLogs = allLogs.filter((log) => {
        const logDate = new Date(log.created_at).toISOString().split('T')[0];
        return logDate === filterDate;
      });
    }

    // Buat data tren 7 hari terakhir (Chart Harian)
    const chartLabels = [];
    const chartValues = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      chartLabels.push(label);
      chartValues.push(dailyMap[key] || 0);
    }

    // Top 5 panitia untuk grafik bar
    const topPanitia = analisisPanitia.slice(0, 5);
    const rankingLabels = topPanitia.map((p) => p.nama);
    const rankingValues = topPanitia.map((p) => p.totalClicks);

    const summary = {
      totalAllTime: totalAllClicks,
      filteredTotal: filteredLogs.length,
      totalPanitia: analisisPanitia.length,
      panitiaPernahDiklik: analisisPanitia.filter((p) => p.totalClicks > 0).length,
      panitiaBelumDiklik: analisisPanitia.filter((p) => p.totalClicks === 0).length,
      rataRataKlik: rataRataKlik.toFixed(1),
      topPanitiaUtama: analisisPanitia[0] || null,
      platformTotals: {
        whatsapp: totalWA,
        instagram: totalIG,
        tiktok: totalTikTok,
        threads: totalThreads,
      },
      chartLabels,
      chartValues,
      rankingLabels,
      rankingValues,
    };

    return {
      success: true,
      rawPanitiaList: panitiaList,
      data: filteredLogs,
      analisisPanitia,
      summary,
    };
  } catch (error) {
    return { success: false, data: [], analisisPanitia: [], summary: null, error: error.message };
  }
}

/**
 * Hapus seluruh riwayat data trafik sosmed panitia (Reset Total)
 */
export async function hapusSemuaTrafikSosmed() {
  try {
    await requirePanitiaPermission('panitia');

    const { error } = await supabaseAdmin
      .from('trafik_sosmed')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Seluruh riwayat trafik sosmed berhasil dibersihkan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus data trafik sosmed pada tanggal tertentu (YYYY-MM-DD)
 */
export async function hapusTrafikSosmedPerTanggal(targetDate) {
  try {
    await requirePanitiaPermission('panitia');

    if (!targetDate) return { success: false, error: 'Tanggal wajib ditentukan.' };

    const start = `${targetDate}T00:00:00.000Z`;
    const end = `${targetDate}T23:59:59.999Z`;

    const { error } = await supabaseAdmin
      .from('trafik_sosmed')
      .delete()
      .gte('created_at', start)
      .lte('created_at', end);

    if (error) return { success: false, error: error.message };

    return { success: true, message: `Data trafik sosmed pada tanggal ${targetDate} berhasil dihapus.` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus data trafik sosmed yang lebih lama dari N hari yang lalu
 */
export async function hapusTrafikSosmedLebihLamaDari(intervalHari) {
  try {
    await requirePanitiaPermission('panitia');

    const days = parseInt(intervalHari, 10);
    if (isNaN(days) || days < 1) {
      return { success: false, error: 'Interval hari minimal 1.' };
    }

    const batasWaktu = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from('trafik_sosmed')
      .delete()
      .lt('created_at', batasWaktu);

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      message: `Data trafik sosmed yang lebih lama dari ${days} hari berhasil dibersihkan.`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

