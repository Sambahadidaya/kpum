// In-memory sliding rate limiter per IP / key

const trackers = new Map();

/**
 * Memeriksa apakah identifier melebihi batas request dalam window milidetik
 * @param {string} key Identifier unik (misal IP address)
 * @param {number} limit Batas maksimum pemanggilan
 * @param {number} windowMs Rentang waktu dalam milidetik
 * @returns {boolean} true jika diizinkan, false jika melebihi kuota
 */
export function checkRateLimit(key, limit = 10, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = trackers.get(key) || [];

  // Filter timestamps yang masih berada dalam windowMs
  const validTimestamps = record.filter((timestamp) => now - timestamp < windowMs);

  if (validTimestamps.length >= limit) {
    trackers.set(key, validTimestamps);
    return false; // Rate limit tercapai
  }

  validTimestamps.push(now);
  trackers.set(key, validTimestamps);

  // Bersihkan memori secara berkala jika map terlalu besar
  if (trackers.size > 10000) {
    trackers.clear();
  }

  return true;
}
