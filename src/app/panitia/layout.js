import { getPanitiaSession } from '@/utils/supabaseUtils';
import PanitiaLayoutWrapper from '@/components/panitia/PanitiaLayoutWrapper';

export const metadata = {
  title: 'Panel Panitia - KPU Mahasiswa Politeknik LP3I',
  description: 'Sistem Administrasi Khusus Panitia Komisi Pemilihan Umum Mahasiswa LP3I.',
};

export default async function PanitiaLayout({ children }) {
  const currentAdmin = await getPanitiaSession();

  return (
    <PanitiaLayoutWrapper currentAdmin={currentAdmin}>
      {children}
    </PanitiaLayoutWrapper>
  );
}
