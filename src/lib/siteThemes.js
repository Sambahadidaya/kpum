// Konfigurasi tema visual KPU Pemilu Presma BEM LP3I
// Aksen Biru Resmi KPU LP3I di Light Mode & Dark Mode

export const THEME_CONFIG = {
  defaultTheme: 'dark',
  colors: {
    primary: {
      light: '#1e40af', // Blue 800 KPU LP3I
      dark: '#f8fafc',  // Slate 50
      accent: '#2563eb', // Blue 600
    },
    background: {
      dark: '#000000',
      darkSection: '#0b0f19',
      darkCard: '#09090b',
      light: '#ffffff',
      lightSection: '#eff6ff', // KPU 50
      lightCard: '#ffffff',
    },
    text: {
      dark: '#f8fafc',
      darkMuted: '#94a3b8',
      light: '#0f172a',
      lightMuted: '#64748b',
    },
    border: {
      dark: '#1e293b',
      light: '#bfdbfe',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
};
