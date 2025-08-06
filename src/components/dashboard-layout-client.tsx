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
  FileText,
  Users,
  Settings,
  Hospital,
  LogOut,
  ChevronDown,
  FolderKanban,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import React from "react"

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

function NavItem({ item, pathname }: { item: any; pathname: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (item.subItems) {
    const isParentActive = item.subItems.some((subItem: any) => pathname.startsWith(subItem.href));
    
    React.useEffect(() => {
      if (isParentActive) {
        setIsOpen(true);
      }
    }, [isParentActive]);

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setIsOpen(!isOpen)}
          isActive={isParentActive}
          tooltip={item.label}
          asChild={false} 
        >
          <div>
            <item.icon className="size-4" />
            <span>{item.label}</span>
            <ChevronDown className={`ml-auto size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </SidebarMenuButton>
        {isOpen && (
          <SidebarMenuSub>
            {item.subItems.map((subItem: any) => (
              <SidebarMenuSubItem key={subItem.href}>
                 <Link href={subItem.href} passHref>
                    <SidebarMenuSubButton isActive={pathname.startsWith(subItem.href)} asChild>
                        <span>{subItem.label}</span>
                    </SidebarMenuSubButton>
                  </Link>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Link href={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith(item.href)}
          tooltip={item.label}
        >
           <div>
            <item.icon className="size-4" />
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
              <NavItem key={index} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
          
          <SidebarMenu className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground px-2 group-data-[state=expanded]:block hidden mb-2">Administrasi</p>
             {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <div>
                      <item.icon className="size-4" />
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
              <Link href="/">
                <SidebarMenuButton tooltip="Logout" asChild>
                  <div>
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <div className="ml-auto flex-1 sm:flex-initial">
                   {/* Search can go here */}
                </div>
                <UserNav />
            </div>
        </header>
        <main className="flex-1 overflow-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
