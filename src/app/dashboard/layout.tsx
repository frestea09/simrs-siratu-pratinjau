
import DashboardClientLayout from '@/components/dashboard-layout-client';
import { getCurrentUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { UserStoreProvider } from '@/store/user-store';
import { IndicatorStoreProvider } from '@/store/indicator-store';
import { IncidentStoreProvider } from '@/store/incident-store';
import { RiskStoreProvider } from '@/store/risk-store';
import { LogStoreProvider } from '@/store/log-store';
import { NotificationStoreProvider } from '@/store/notification-store';


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
    <UserStoreProvider>
      <IndicatorStoreProvider>
        <IncidentStoreProvider>
          <RiskStoreProvider>
            <LogStoreProvider>
              <NotificationStoreProvider>
                <DashboardClientLayout user={user}>{children}</DashboardClientLayout>
              </NotificationStoreProvider>
            </LogStoreProvider>
          </RiskStoreProvider>
        </IncidentStoreProvider>
      </IndicatorStoreProvider>
    </UserStoreProvider>
  );
}
