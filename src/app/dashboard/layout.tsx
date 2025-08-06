import { redirect } from 'next/navigation';
import DashboardClientLayout from '@/components/dashboard-layout-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In a real app, you'd have authentication logic here.
  const isAuthenticated = true; 

  if (!isAuthenticated) {
    redirect('/login');
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
