
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
  Target,
  Building,
  Network,
  Activity,
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
      {
        label: "Indikator Mutu",
        icon: Activity,
        subItems: [
          { href: "/dashboard/spm", icon: ListChecks, label: "Standar Pelayanan Minimal" },
          { href: "/dashboard/inm", icon: Target, label: "Indikator Nasional Mutu" },
          { href: "/dashboard/imp-rs", icon: Building, label: "Indikator Mutu Prioritas RS" },
          { href: "/dashboard/ipu", icon: Network, label: "Indikator Prioritas Unit" },
        ]
      },
      { href: "/dashboard/indicators", icon: FolderKanban, label: "Manajemen Indikator" },
      { href: "/dashboard/incidents", icon: ShieldAlert, label: "Insiden Keselamatan" },
    ]
  },
  {
    label: "Manajemen",
    icon: ClipboardCheck,
    subItems: [
      { href: "/dashboard/surveys", icon: ClipboardCheck, label: "Survei Budaya" },
      { href: "/dashboard/risks", icon: BarChart3, label: "Manajemen Risiko" },
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
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({});
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

  const findPath = (items: any[], currentPath: string): any[] => {
      for (const item of items) {
        if (item.href === currentPath) {
          return [item];
        }
        if (item.subItems) {
          const subPath = findPath(item.subItems, currentPath);
          if (subPath.length > 0) {
            return [item, ...subPath];
          }
        }
      }
      return [];
    };

  const breadcrumbPath = findPath(navItems.concat(adminNavItems), pathname);
  const currentPage = breadcrumbPath[breadcrumbPath.length - 1];

  // Automatically open parent menus of active subitem
  React.useEffect(() => {
    const newOpenMenus: { [key: string]: boolean } = {};
    const activeParents = findPath(navItems.concat(adminNavItems), pathname);
    activeParents.forEach(item => {
        if(item.subItems) newOpenMenus[item.label] = true;
    });
    setOpenMenus(newOpenMenus);
  }, [pathname]);

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      >
        <SidebarHeader className="h-20 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 group-data-[state=expanded]:w-full">
            <Button
              variant="ghost"
              size="icon"
              className="size-11 shrink-0 bg-primary/20 text-primary hover:bg-primary/30 group-data-[state=collapsed]:bg-transparent"
              asChild
            >
              <Link href="/dashboard/overview">
                <Hospital className="size-6" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold tracking-tight truncate group-data-[state=collapsed]:hidden">
              Si Ratu Web
            </h1>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item, index) => (
              <NavItem key={index} item={item} pathname={pathname} openMenus={openMenus} setOpenMenus={setOpenMenus} />
            ))}
          </SidebarMenu>
          
          {currentUser?.role === 'Admin Sistem' && (
            <SidebarMenu className="mt-4 pt-2 border-t border-sidebar-border/50">
              <p className="text-sm font-semibold text-muted-foreground/80 px-4 group-data-[state=expanded]:block hidden mb-2">
                Administrasi
              </p>
              {adminNavItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} openMenus={openMenus} setOpenMenus={setOpenMenus} />
              ))}
            </SidebarMenu>
          )}
        </SidebarContent>

        <SidebarFooter className="p-2 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <NavItem item={{ label: 'Logout', icon: LogOut, onClick: handleLogout }} pathname={pathname} openMenus={openMenus} setOpenMenus={setOpenMenus} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-auto min-h-20 flex-col border-b bg-background px-4 md:px-6">
            <div className="flex items-center w-full py-3">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-3xl font-bold flex-1">
                    {currentPage?.label || 'Dashboard'}
                </h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                        <Bell className="h-6 w-6" />
                        <span className="sr-only">Notifikasi</span>
                    </Button>
                    <UserNav />
                </div>
            </div>
            <div className="pb-3">
                <Breadcrumb navItems={navItems.concat(adminNavItems)} />
            </div>
        </header>
        <main className="flex-1 overflow-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
