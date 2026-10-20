/**
 * Konfigurasi Waktu & Delay Animasi (Timing Configuration)
 * 
 * File ini mengontrol seluruh durasi dan delay untuk:
 * 1. Site Opening (Splash Screen)
 * 2. Petunjuk Navigasi Mobile (MobileNavHint)
 * 3. Notifikasi Bubble Sams Asisten AI
 * 
 * Anda dapat menyesuaikan angka (dalam milidetik / ms) di sini untuk mengatur alur kemunculan.
 */

export const TIMING_CONFIG = {
  // === 1. SITE OPENING (SPLASH SCREEN) ===
  // 1a. Waktu layar gelap pekat sebelum logo mulai meluncur dari bawah
  OPENING_DARK_DELAY: 500,

  // 1b. Waktu logo mencapai tengah dan mulai membesar + muncul ring border berputar
  OPENING_EXPAND_START: 1300,

  // 1c. Waktu saat animasi fade out opening mulai dijalankan
  OPENING_FADE_OUT_START: 2800,

  // 1d. Total durasi SiteOpening hingga benar-benar hilang / unmount
  OPENING_TOTAL_DURATION: 3400,

  // === 2. NOTIFIKASI NAVBAR MOBILE (MOBILE NAV HINT) ===
  // Delay kemunculan notifikasi navbar mobile (setelah opening selesai)
  MOBILE_NAV_HINT_DELAY: 4300,

  // === 3. NOTIFIKASI SAMS ASISTEN AI ===
  // Delay kemunculan bubble pesan Sams Asisten
  SAMS_NOTIF_DELAY: 6200,
};

export default TIMING_CONFIG;
