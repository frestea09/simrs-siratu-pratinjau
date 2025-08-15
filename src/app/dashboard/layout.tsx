
import DashboardClientLayout from '@/components/dashboard-layout-client';
import { getCurrentUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  return (
    <DashboardClientLayout user={user}>{children}</DashboardClientLayout>
  );
}
