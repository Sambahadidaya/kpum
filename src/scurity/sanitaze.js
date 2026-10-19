// Utilitas sanitasi input untuk mencegah XSS & input berbahaya

export function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // hilangkan karakter tag HTML mentah
    .slice(0, 1000); // batasi panjang
}

export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean) ? clean : '';
}

export function sanitizePhone(phone) {
  if (typeof phone !== 'string' && typeof phone !== 'number') return '';
  const str = String(phone).trim();
  // Ambil hanya angka dan tanda plus di depan jika ada
  const clean = str.replace(/[^0-9+]/g, '');
  return clean.slice(0, 20);
}

export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  return '';
}
