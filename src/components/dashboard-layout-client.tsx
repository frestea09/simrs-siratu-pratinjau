
"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  HeartPulse,
  ShieldAlert,
  ClipboardCheck,
  BarChart3,
  Users,
  Settings,
  Hospital,
  LogOut,
  FolderKanban,
  FileText,
  Bell,
  ListChecks,
  History,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import React from "react"
import { Breadcrumb } from "@/components/molecules/breadcrumb"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { NavItem } from "./molecules/nav-item"

const navItems = [
  { 
    href: "/dashboard/overview", 
    icon: LayoutDashboard, 
    label: "Dashboard" 
  },
  {
    label: "Layanan",
    icon: HeartPulse,
    subItems: [
      { href: "/dashboard/indicators", icon: HeartPulse, label: "Indikator Mutu" },
      { href: "/dashboard/incidents", icon: ShieldAlert, label: "Insiden Keselamatan" },
      { href: "/dashboard/spm", icon: ListChecks, label: "Standar Pelayanan Minimal" },
    ]
  },
  {
    label: "Manajemen",
    icon: FolderKanban,
    subItems: [
      { href: "/dashboard/surveys", icon: ClipboardCheck, label: "Survei Budaya" },
      { href: "/dashboard/risks", icon: BarChart3, label: "Manajemen Risiko" },
      { href: "/dashboard/reports", icon: FileText, label: "Laporan" },
    ]
  },
]

const adminNavItems = [
    { href: "/dashboard/users", icon: Users, label: "Manajemen Pengguna" },
    { href: "/dashboard/logs", icon: History, label: "Log Sistem" },
    { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
]

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter();
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const { currentUser, clearCurrentUser } = useUserStore();
  const { addLog } = useLogStore();

  const handleLogout = () => {
    if(currentUser) {
       addLog({
        user: currentUser.name,
        action: 'LOGOUT',
        details: 'Pengguna berhasil logout.'
      })
    }
    clearCurrentUser();
    router.push('/');
  }

  const allNavItems = [...navItems, ...adminNavItems];
  
  const getCurrentPage = () => {
    for (const item of allNavItems) {
      if (item.href === pathname) return item;
      if (item.subItems) {
        const subItem = item.subItems.find(sub => pathname.startsWith(sub.href));
        if (subItem) return subItem;
      }
    }
    return null;
  };
  
  const currentPage = getCurrentPage();

  // Automatically open parent menu of active subitem
  React.useEffect(() => {
    const activeParent = navItems.find(item => item.subItems?.some(sub => pathname.startsWith(sub.href)));
    if (activeParent) {
      setOpenMenu(activeParent.label);
    }
  }, [pathname]);

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      >
        <SidebarHeader className="h-16 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 group-data-[state=expanded]:w-full">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 bg-primary/20 text-primary hover:bg-primary/30 group-data-[state=collapsed]:bg-transparent"
              asChild
            >
              <Link href="/dashboard/overview">
                <Hospital className="size-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold tracking-tight truncate group-data-[state=collapsed]:hidden">
              Si Ratu Web
            </h1>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item, index) => (
              <NavItem key={index} item={item} pathname={pathname} openMenu={openMenu} setOpenMenu={setOpenMenu} />
            ))}
          </SidebarMenu>
          
          {currentUser?.role === 'Admin Sistem' && (
            <SidebarMenu className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground px-2 group-data-[state=expanded]:block hidden mb-2">Administrasi</p>
              {adminNavItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} openMenu={openMenu} setOpenMenu={setOpenMenu} />
              ))}
            </SidebarMenu>
          )}
        </SidebarContent>

        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <NavItem item={{ label: 'Logout', icon: LogOut, onClick: handleLogout }} pathname={pathname} openMenu={openMenu} setOpenMenu={setOpenMenu} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-auto min-h-16 flex-col border-b bg-background px-4 md:px-6">
            <div className="flex items-center w-full py-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-2xl font-bold flex-1">
                    {currentPage?.label || 'Dashboard'}
                </h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifikasi</span>
                    </Button>
                    <UserNav />
                </div>
            </div>
            <div className="pb-2">
                <Breadcrumb navItems={allNavItems} />
            </div>
        </header>
        <main className="flex-1 overflow-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
