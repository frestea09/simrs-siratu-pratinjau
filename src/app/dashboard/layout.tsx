import DashboardClientLayout from '@/components/dashboard-layout-client';
import { LogStoreProvider } from '@/store/log-store.tsx';
import { UserStoreProvider } from '@/store/user-store.tsx';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <UserStoreProvider>
      <LogStoreProvider>
        <DashboardClientLayout>{children}</DashboardClientLayout>
      </LogStoreProvider>
    </UserStoreProvider>
  );
}
