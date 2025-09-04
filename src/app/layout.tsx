

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <UserStoreProvider>
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
        </UserStoreProvider>
      </body>
    </html>
  )
}
