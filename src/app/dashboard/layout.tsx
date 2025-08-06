import DashboardClientLayout from '@/components/dashboard-layout-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <DashboardClientLayout>{children}</DashboardClientLayout>
  );
}
