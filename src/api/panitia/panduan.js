'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';
import { sanitizeText, sanitizeUrl } from '@/scurity/sanitaze';

/**
 * Mengambil seluruh data panduan dan sub-panduan untuk panitia
 */
export async function getPanitiaPanduanList() {
  try {
    await requirePanitiaPermission('panduan');

    const { data: panduanList, error: pError } = await supabaseAdmin
      .from('panduan')
      .select('id, judul, urutan, created_at')
      .order('urutan', { ascending: true });

    if (pError) return { success: false, data: [], error: pError.message };

    const { data: isiList, error: iError } = await supabaseAdmin
      .from('isi_panduan')
      .select('id, judul_panduan_id, sub_judul, isi, link_vidio, urutan, created_at, update_at')
      .order('urutan', { ascending: true });

    if (iError) return { success: false, data: [], error: iError.message };

    const structured = (panduanList || []).map((p) => ({
      ...p,
      items: (isiList || []).filter((item) => item.judul_panduan_id === p.id),
    }));

    return { success: true, data: structured };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Simpan / Edit Judul Utama Panduan / Bab
 */
export async function simpanJudulPanduan(idOrPayload, judulParam, urutanParam = 1) {
  try {
    await requirePanitiaPermission('panduan');

    let id = null;
    let judul = '';
    let urutan = 1;

    if (typeof idOrPayload === 'object' && idOrPayload !== null) {
      id = idOrPayload.id;
      judul = idOrPayload.judul;
      urutan = idOrPayload.urutan ?? 1;
    } else {
      id = idOrPayload;
      judul = judulParam;
      urutan = urutanParam ?? 1;
    }

    const cleanJudul = sanitizeText(judul || '');
    if (!cleanJudul) return { success: false, error: 'Judul Panduan wajib diisi.' };

    if (id) {
      const { error } = await supabaseAdmin.from('panduan').update({
        judul: cleanJudul,
        urutan: Number(urutan) || 1,
      }).eq('id', id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabaseAdmin.from('panduan').insert({
        judul: cleanJudul,
        urutan: Number(urutan) || 1,
      });

      if (error) return { success: false, error: error.message };
    }

    return { success: true, message: 'Judul Panduan berhasil disimpan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export const simpanPanduanBab = simpanJudulPanduan;

/**
 * Hapus Judul Panduan (beserta isinya cascade)
 */
export async function hapusJudulPanduan(id) {
  try {
    await requirePanitiaPermission('panduan');
    const { error } = await supabaseAdmin.from('panduan').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Judul Panduan berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export const hapusPanduanBab = hapusJudulPanduan;

/**
 * Simpan / Edit Sub-Isi Panduan
 */
export async function simpanIsiPanduan(payload) {
  try {
    await requirePanitiaPermission('panduan');

    const id = payload.id;
    const judulPanduanId = payload.judul_panduan_id;
    const subJudul = sanitizeText(payload.sub_judul || '');
    const isi = payload.isi || ''; // markdown text
    const linkVidio = sanitizeUrl(payload.link_vidio || '');
    const urutan = Number(payload.urutan) || 1;

    if (!judulPanduanId || !subJudul || !isi) {
      return { success: false, error: 'Kategori Panduan, Sub-Judul, dan Isi Panduan wajib diisi.' };
    }

    if (id) {
      const { error } = await supabaseAdmin.from('isi_panduan').update({
        judul_panduan_id: judulPanduanId,
        sub_judul: subJudul,
        isi: isi,
        link_vidio: linkVidio || null,
        urutan: urutan,
        update_at: new Date().toISOString(),
      }).eq('id', id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabaseAdmin.from('isi_panduan').insert({
        judul_panduan_id: judulPanduanId,
        sub_judul: subJudul,
        isi: isi,
        link_vidio: linkVidio || null,
        urutan: urutan,
      });

      if (error) return { success: false, error: error.message };
    }

    return { success: true, message: 'Isi materi panduan berhasil disimpan.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hapus Sub-Isi Panduan
 */
export async function hapusIsiPanduan(id) {
  try {
    await requirePanitiaPermission('panduan');
    const { error } = await supabaseAdmin.from('isi_panduan').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Isi panduan berhasil dihapus.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
