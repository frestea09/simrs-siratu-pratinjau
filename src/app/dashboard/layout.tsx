import DashboardClientLayout from '@/components/dashboard-layout-client';
import type { User } from '@prisma/client';
import { getCurrentUser } from '@/lib/actions/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();
  return (
    <DashboardClientLayout user={user as User}>{children}</DashboardClientLayout>
  );
}
