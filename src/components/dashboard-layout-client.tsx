
"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
  ChevronDown,
  FolderKanban,
  FileText,
  Bell,
  ListChecks,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import React from "react"
import { Breadcrumb } from "@/components/molecules/breadcrumb"

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
    { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
]

function NavItem({ item, pathname, openMenu, setOpenMenu }: { item: any; pathname: string; openMenu: string | null; setOpenMenu: (label: string | null) => void; }) {
  const isParentActive = item.subItems?.some((subItem: any) => pathname.startsWith(subItem.href));
  const isOpen = openMenu === item.label;

  React.useEffect(() => {
    if (isParentActive && !isOpen) {
      setOpenMenu(item.label);
    }
  }, [isParentActive, item.label, setOpenMenu, isOpen]);

  const handleClick = () => {
    if (item.subItems) {
      setOpenMenu(isOpen ? null : item.label);
    }
  };

  if (item.subItems) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleClick}
          isActive={isParentActive}
          tooltip={item.label}
          asChild={false}
          size="lg"
        >
          <div>
            <item.icon className="size-6" />
            <span>{item.label}</span>
            <ChevronDown className={`ml-auto size-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </SidebarMenuButton>
        <SidebarMenuSub className={`mt-1 pl-4 pr-0`}>
          {isOpen && item.subItems.map((subItem: any) => (
            <SidebarMenuSubItem key={subItem.href} className="mb-1">
                <Link href={subItem.href} passHref legacyBehavior>
                  <SidebarMenuSubButton as="a" isActive={pathname.startsWith(subItem.href)} className="h-9">
                      <span>{subItem.label}</span>
                  </SidebarMenuSubButton>
                </Link>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
       <Link href={item.href} passHref legacyBehavior>
          <SidebarMenuButton
            as="a"
            isActive={pathname.startsWith(item.href)}
            tooltip={item.label}
            size="lg"
          >
            <div>
              <item.icon className="size-6" />
              <span>{item.label}</span>
            </div>
          </SidebarMenuButton>
        </Link>
    </SidebarMenuItem>
  );
}

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

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
          
          <SidebarMenu className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground px-2 group-data-[state=expanded]:block hidden mb-2">Administrasi</p>
             {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    as="a"
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    size="lg"
                  >
                    <div>
                      <item.icon className="size-6" />
                      <span>{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" asChild>
                <SidebarMenuButton tooltip="Logout" size="lg">
                  <div>
                    <LogOut className="size-6" />
                    <span>Logout</span>
                  </div>
                </SidebarMenuButton>
              </Link>
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
