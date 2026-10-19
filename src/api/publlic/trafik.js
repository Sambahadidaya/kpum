'use server';

import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit } from '@/scurity/rateLimiter';

/**
 * Mendeteksi kategori sumber traffic dari referrer atau UTM source
 */
function deteksiSumberTraffic(referrer = '', utmSource = '') {
  const ref = (referrer || '').toLowerCase();
  const utm = (utmSource || '').toLowerCase();

  if (utm) {
    if (utm.includes('whatsapp') || utm.includes('wa')) return 'WhatsApp';
    if (utm.includes('instagram') || utm.includes('ig')) return 'Instagram';
    if (utm.includes('tiktok')) return 'TikTok';
    if (utm.includes('facebook') || utm.includes('fb')) return 'Facebook';
    if (utm.includes('twitter') || utm.includes('x')) return 'Twitter/X';
    if (utm.includes('telegram')) return 'Telegram';
    if (utm.includes('google')) return 'Google Search';
    return utm;
  }

  if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'WhatsApp';
  if (ref.includes('instagram.com') || ref.includes('l.instagram.com')) return 'Instagram';
  if (ref.includes('tiktok.com')) return 'TikTok';
  if (ref.includes('facebook.com') || ref.includes('l.facebook.com')) return 'Facebook';
  if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) return 'Twitter/X';
  if (ref.includes('t.me') || ref.includes('telegram.org')) return 'Telegram';
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.')) return 'Search Engine';
  if (!ref) return 'Langsung (Direct)';

  try {
    const url = new URL(ref);
    return url.hostname;
  } catch (e) {
    return 'Website Lain';
  }
}

/**
 * Server Action: Mencatat kunjungan dan lookup info ISP / Kota
 * @param {Object} payload { referrer, utmSource, path }
 */
export async function catatTrafikKunjungan(payload = {}) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const userAgent = headersList.get('user-agent') || '';

    // Cegah pencatatan dobel/spam: Maksimal 1 catatan per 15 detik per IP
    const allowed = checkRateLimit(`traffic_${clientIp}`, 1, 15 * 1000);
    if (!allowed) {
      return { success: true, cached: true };
    }

    const sumber = deteksiSumberTraffic(payload.referrer, payload.utmSource);
    const path = payload.path || '/';

    // Ambil info Geo & ISP (menggunakan ipwho.is dengan timeout 2 detik)
    let kota = 'Indonesia';
    let isp = 'ISP Lokal';
    let negara = 'Indonesia';

    // Cek header vercel jika tersedia
    const vercelCity = headersList.get('x-vercel-ip-city');
    const vercelCountry = headersList.get('x-vercel-ip-country');
    if (vercelCity) kota = decodeURIComponent(vercelCity);
    if (vercelCountry) negara = vercelCountry;

    // Jika bukan IP lokal/internal, lookup ISP
    const isLocalIp = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.');
    if (!isLocalIp) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`http://ipwho.is/${clientIp}`, {
          signal: controller.signal,
          next: { revalidate: 3600 },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const geo = await res.json();
          if (geo && geo.success) {
            kota = geo.city || kota;
            negara = geo.country || negara;
            isp = geo.connection?.isp || geo.connection?.org || isp;
          }
        }
      } catch (e) {
        // Abaikan kegagalan geo lookup, gunakan default
      }
    }

    // Simpan ke tabel trafik di Supabase
    await supabaseAdmin.from('trafik').insert({
      ip_address: clientIp,
      isp: isp.slice(0, 100),
      kota: kota.slice(0, 100),
      negara: negara.slice(0, 100),
      sumber: sumber.slice(0, 100),
      referrer: (payload.referrer || '').slice(0, 255),
      path: path.slice(0, 100),
      user_agent: userAgent.slice(0, 255),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
