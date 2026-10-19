import { redirect } from 'next/navigation';
import { getPanitiaSession } from '@/utils/supabaseUtils';

export default async function PanitiaIndexPage() {
  const session = await getPanitiaSession();
  if (!session) {
    redirect('/panitia/login');
  }
  redirect('/panitia/dashboard');
}
