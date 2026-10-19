'use server';

import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/scurity/sanitaze';
import { checkRateLimit } from '@/scurity/rateLimiter';

/**
 * Server Action: Mengirim pesan kontak dari pengunjung
 * @param {Object} payload { nama, emailOrNoTelp, jenisKontak, pesan }
 */
export async function kirimPesanKontak(payload) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Rate limit: Maksimal 5 pesan per 5 menit per IP
    const allowed = checkRateLimit(`contact_${clientIp}`, 5, 5 * 60 * 1000);
    if (!allowed) {
      return {
        success: false,
        error: 'Terlalu banyak permintaan pengiriman pesan. Silakan tunggu beberapa saat lagi.',
      };
    }

    const nama = sanitizeText(payload.nama || '');
    const jenisKontak = payload.jenisKontak === 'email' ? 'email' : 'whatsapp';
    let emailOrNoTelp = payload.emailOrNoTelp || '';

    if (jenisKontak === 'email') {
      emailOrNoTelp = sanitizeEmail(emailOrNoTelp);
      if (!emailOrNoTelp) {
        return { success: false, error: 'Format alamat email tidak valid.' };
      }
    } else {
      emailOrNoTelp = sanitizePhone(emailOrNoTelp);
      if (!emailOrNoTelp || emailOrNoTelp.length < 8) {
        return { success: false, error: 'Nomor WhatsApp minimal 8 digit angka.' };
      }
    }

    const pesanKontak = sanitizeText(payload.pesan || '');
    if (!pesanKontak || pesanKontak.length < 5) {
      return { success: false, error: 'Isi pesan terlalu pendek (minimal 5 karakter).' };
    }

    const { error } = await supabaseAdmin.from('kontak').insert({
      nama: nama || 'Pengunjung Mahasiswa',
      email_or_notelp: emailOrNoTelp,
      jenis_kontak: jenisKontak,
      pesan_kontak: pesanKontak,
      status: 'belum_dibaca',
    });

    if (error) {
      return { success: false, error: 'Gagal menyimpan pesan: ' + error.message };
    }

    return {
      success: true,
      message: 'Pesan Anda berhasil dikirim ke Panitia KPU. Terima kasih!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat mengirim pesan.',
    };
  }
}
