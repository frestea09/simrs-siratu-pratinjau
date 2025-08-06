import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { UserStoreProvider } from '@/store/user-store.tsx';
import { LogStoreProvider } from '@/store/log-store.tsx';

export const metadata: Metadata = {
  title: 'Si Ratu Web',
  description: 'Sistem Informasi Rapor Mutu RSUD Oto Iskandar Dinata',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <UserStoreProvider>
          <LogStoreProvider>
            {children}
            <Toaster />
          </LogStoreProvider>
        </UserStoreProvider>
      </body>
    </html>
  );
}
