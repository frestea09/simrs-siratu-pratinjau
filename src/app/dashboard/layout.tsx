
import DashboardClientLayout from '@/components/dashboard-layout-client';
import { NavItem } from '@/types/nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <DashboardClientLayout>{children}</DashboardClientLayout>
  );
}
