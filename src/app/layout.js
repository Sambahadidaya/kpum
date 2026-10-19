import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ThemeProvider } from 'next-themes';
import DynamicFavicon from '@/components/DynamicFavicon';

export const metadata = {
  title: 'KPU Pemilu Mahasiswa - Politeknik LP3I',
  description: 'Portal Informasi Resmi Komisi Pemilihan Umum Mahasiswa (KPU) Pemilu Presiden dan Wakil Presiden BEM Politeknik LP3I.',
  keywords: ['KPU', 'Pemilu BEM', 'Politeknik LP3I', 'Presma', 'Wapresma', 'Mahasiswa'],
  authors: [{ name: 'KPU Mahasiswa Politeknik LP3I' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <DynamicFavicon />
      </head>
      <body className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 antialiased selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
