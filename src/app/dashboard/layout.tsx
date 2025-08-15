import DashboardClientLayout from '@/components/dashboard-layout-client';
import type { User } from '@prisma/client';
import { getCurrentUser } from '@/lib/actions/auth';
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
  
  return (
    <IndicatorStoreProvider>
      <IncidentStoreProvider>
        <RiskStoreProvider>
            <LogStoreProvider>
              <NotificationStoreProvider>
                <DashboardClientLayout user={user as User}>{children}</DashboardClientLayout>
              </NotificationStoreProvider>
            </LogStoreProvider>
        </RiskStoreProvider>
      </IncidentStoreProvider>
    </IndicatorStoreProvider>
  );
}
