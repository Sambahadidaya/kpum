import { redirect } from 'next/navigation';
import { getPanitiaSession } from '@/utils/supabaseUtils';
import { getFirstAccessibleRoute } from '@/lib/adminRoleData';

export default async function PanitiaIndexPage() {
  const session = await getPanitiaSession();
  if (!session) {
    redirect('/panitia/login');
  }
  const targetRoute = getFirstAccessibleRoute(session.roleAkses, session.role);
  redirect(targetRoute);
}
