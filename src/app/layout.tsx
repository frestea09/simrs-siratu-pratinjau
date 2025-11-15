

import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { UserStoreProvider } from "@/store/user-store"
import { LogStoreProvider } from "@/store/log-store"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NotificationStoreProvider } from "@/store/notification-store"
import { IndicatorStoreProvider } from "@/store/indicator-store"
import { IncidentStoreProvider } from "@/store/incident-store"
import { RiskStoreProvider } from "@/store/risk-store"
import { SurveyStoreProvider } from "@/store/survey-store"
import { UnitStoreProvider } from "@/store/unit-store"

export const metadata: Metadata = {
  title: "SIRATU",
  description: "Sistem Informasi Pelaporan Indikator Mutu",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
        <UserStoreProvider>
          <UnitStoreProvider>
            <LogStoreProvider>
              <NotificationStoreProvider>
                <IndicatorStoreProvider>
                  <IncidentStoreProvider>
                    <RiskStoreProvider>
                      <SurveyStoreProvider>
                        <TooltipProvider>
                          {children}
                          <Toaster />
                        </TooltipProvider>
                      </SurveyStoreProvider>
                    </RiskStoreProvider>
                  </IncidentStoreProvider>
                </IndicatorStoreProvider>
              </NotificationStoreProvider>
            </LogStoreProvider>
          </UnitStoreProvider>
        </UserStoreProvider>
      </body>
    </html>
  )
}
