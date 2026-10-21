'use client';

/**
 * Komponen Bendera Negara Berbasis SVG Murni
 * Menjamin bendera tampil berupa grafis bendera asli di semua sistem operasi
 * (termasuk Windows, di mana emoji bendera di-render sebagai inisial teks dua huruf seperti "ID", "US", "JP", dsb).
 * 
 * Bebas dependensi eksternal, bebas blokir CSP next.config.mjs, dan instan tanpa request jaringan.
 */
export default function CountryFlag({ code, className = 'w-5 h-3.5' }) {
  const normalized = (code || '').toLowerCase();

  const renderFlagSvg = () => {
    switch (normalized) {
      case 'id':
        // Bendera Indonesia: Merah Putih
        return (
          <svg viewBox="0 0 60 40" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="20" fill="#CE1126" />
            <rect y="20" width="60" height="20" fill="#FFFFFF" />
          </svg>
        );

      case 'en':
      case 'us':
        // Bendera Amerika Serikat (English US): Stripes Merah-Putih & Canton Biru Bintang
        return (
          <svg viewBox="0 0 60 40" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="40" fill="#B22234" />
            <rect y="3.08" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="9.23" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="15.38" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="21.54" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="27.69" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="33.85" width="60" height="3.08" fill="#FFFFFF" />
            <rect width="25" height="21.54" fill="#3C3B6E" />
            <g fill="#FFFFFF">
              <circle cx="4.5" cy="4" r="1.1" />
              <circle cx="10" cy="4" r="1.1" />
              <circle cx="15.5" cy="4" r="1.1" />
              <circle cx="21" cy="4" r="1.1" />
              <circle cx="7.2" cy="7.5" r="1.1" />
              <circle cx="12.7" cy="7.5" r="1.1" />
              <circle cx="18.2" cy="7.5" r="1.1" />
              <circle cx="4.5" cy="11" r="1.1" />
              <circle cx="10" cy="11" r="1.1" />
              <circle cx="15.5" cy="11" r="1.1" />
              <circle cx="21" cy="11" r="1.1" />
              <circle cx="7.2" cy="14.5" r="1.1" />
              <circle cx="12.7" cy="14.5" r="1.1" />
              <circle cx="18.2" cy="14.5" r="1.1" />
              <circle cx="4.5" cy="18" r="1.1" />
              <circle cx="10" cy="18" r="1.1" />
              <circle cx="15.5" cy="18" r="1.1" />
              <circle cx="21" cy="18" r="1.1" />
            </g>
          </svg>
        );

      case 'japan':
      case 'jp':
        // Bendera Jepang: Putih dengan Lingkaran Merah Hinomaru
        return (
          <svg viewBox="0 0 60 40" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="40" fill="#FFFFFF" />
            <circle cx="30" cy="20" r="12" fill="#BC002D" />
          </svg>
        );

      case 'arab':
      case 'sa':
        // Bendera Arab Saudi: Hijau dengan Kaligrafi Syahadat & Pedang
        return (
          <svg viewBox="0 0 60 40" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="40" fill="#006C35" />
            <g fill="#FFFFFF">
              <path
                d="M13 14c0.8-0.8 2.2-0.8 3 0v4h2v-4c0.8-0.8 2.2-0.8 3 0v4h2v-5c0.8-0.8 2.2-0.8 3 0v5h2v-4c0.8-0.8 2.2-0.8 3 0v4h2v-3c0.8-0.8 2.2-0.8 3 0v3h4v2H13v-2z"
                opacity="0.95"
              />
              <path d="M14.5 9.5h2v3h-2zM20 9.5h2v3h-2zM27 8.5h2v4h-2zM34.5 9.5h2v3h-2zM40 9.5h2v3h-2z" />
              <path d="M47 25l-2.5-2H19c-1 0-1.5 0.8-1.5 1.5s0.5 1.5 1.5 1.5h25.5l2.5-2z" />
              <path d="M16 23.5h2v3h-2z" />
              <circle cx="15" cy="25" r="1.2" />
            </g>
          </svg>
        );

      case 'rusia':
      case 'ru':
        // Bendera Rusia: Tiga Garis Horizontal Putih - Biru - Merah
        return (
          <svg viewBox="0 0 60 40" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="13.33" fill="#FFFFFF" />
            <rect y="13.33" width="60" height="13.33" fill="#0039A6" />
            <rect y="26.66" width="60" height="13.34" fill="#D52B1E" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-700 dark:text-zinc-200">
            {normalized.slice(0, 2).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-xs overflow-hidden border border-black/15 dark:border-white/20 shadow-2xs leading-none select-none ${className}`}
      aria-hidden="true"
    >
      {renderFlagSvg()}
    </span>
  );
}
