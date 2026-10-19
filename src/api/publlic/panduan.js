'use server';

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Server Action: Mengambil data seluruh struktur panduan beserta sub-judul dan isinya
 */
export async function getPublikPanduan() {
  try {
    const { data: panduanList, error: pError } = await supabaseAdmin
      .from('panduan')
      .select('id, judul, urutan')
      .order('urutan', { ascending: true });

    if (pError) {
      return { success: false, data: [], error: pError.message };
    }

    const { data: isiList, error: iError } = await supabaseAdmin
      .from('isi_panduan')
      .select('id, judul_panduan_id, sub_judul, isi, link_vidio, urutan')
      .order('urutan', { ascending: true });

    if (iError) {
      return { success: false, data: [], error: iError.message };
    }

    // Gabungkan isi_panduan ke dalam masing-masing judul panduan
    const structuredPanduan = (panduanList || []).map((p) => {
      const items = (isiList || []).filter((item) => item.judul_panduan_id === p.id);
      return {
        ...p,
        items,
      };
    });

    return { success: true, data: structuredPanduan };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
