/**
 * Konfigurasi Waktu & Delay Animasi (Timing Configuration)
 */

export const TIMING_CONFIG = {
  // === 1. SITE OPENING (SPLASH SCREEN) ===
  // 1a. Waktu layar gelap pekat sebelum logo meluncur dari bawah
  OPENING_DARK_DELAY: 800,

  // 1b. Waktu logo mencapai tengah, membesar + muncul ring border berputar
  OPENING_EXPAND_START: 2200,

  // 1c. Waktu logo & border membesar sedikit (subtle scale) & mulai pudar ke dalam gelap pekat (fade to black)
  OPENING_FADE_OUT_START: 4600,

  // 1d. Waktu layar sudah gelap pekat total; halaman dirender & transisi fade in dimulai
  OPENING_REVEAL_START: 5400,

  // 1e. Total durasi SiteOpening hingga transisi fade in selesai & overlay di-unmount dari DOM
  OPENING_TOTAL_DURATION: 6400,

  // === 2. NOTIFIKASI NAVBAR MOBILE (MOBILE NAV HINT) ===
  MOBILE_NAV_HINT_DELAY: 7000,

  // === 3. NOTIFIKASI SAMS ASISTEN AI ===
  SAMS_NOTIF_DELAY: 9000,
};

export default TIMING_CONFIG;