"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuItem,
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
  ListChecks,
  History,
  Target,
  Building,
  Network,
  Activity,
  Loader2,
  Bell,
  Cog,
  FileSignature,
} from "lucide-react"
import Link from "next/link"
import favicon from "@/app/favicon.ico"
import { usePathname, useRouter } from "next/navigation"
import { UserNav } from "@/components/user-nav"
import React from "react"
import { Breadcrumb } from "@/components/molecules/breadcrumb"
import { useUserStore, type UserRole } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { NavItem as NavItemType } from "@/types/nav"
import { NavItem } from "./molecules/nav-item"
import { cn } from "@/lib/utils"
import { NotificationPopover } from "./organisms/notification-popover"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { logout } from "@/lib/actions/auth"
import { useRealtimeEvents } from "@/hooks/use-realtime-events"

const baseNavItems: NavItemType[] = [
  {
    href: "/dashboard/overview",
    icon: LayoutDashboard,
    label: "Ringkasan Dasbor",
  },
  {
    label: "Peningkatan Mutu",
    icon: HeartPulse,
    subItems: [
      {
        href: "/dashboard/profiles",
        icon: FileSignature,
        label: "Profil Indikator",
      },
      {
        href: "/dashboard/indicators",
        icon: FolderKanban,
        label: "Manajemen Indikator",
      },
      {
        label: "Dasbor Indikator",
        icon: Activity,
        subItems: [
          { href: "/dashboard/spm", icon: ListChecks, label: "SPM" },
          { href: "/dashboard/inm", icon: Target, label: "INM" },
          { href: "/dashboard/imp-rs", icon: Building, label: "IMP-RS" },
          {
            href: "/dashboard/impu",
            icon: Network,
            label: "IMPU",
          },
        ],
      },
      {
        href: "/dashboard/incidents",
        icon: ShieldAlert,
        label: "Insiden Keselamatan",
      },
      { href: "/dashboard/reports", icon: FileText, label: "Laporan Tahunan" },
    ],
  },
  {
    label: "Manajemen Pendukung",
    icon: ClipboardCheck,
    subItems: [
      {
        href: "/dashboard/surveys",
        icon: ClipboardCheck,
        label: "Survei Budaya",
      },
      { href: "/dashboard/risks", icon: BarChart3, label: "Manajemen Risiko" },
    ],
  },
]

const adminSystemNavItems: NavItemType[] = [
  {
    label: "Pengaturan Sistem",
    icon: Cog,
    subItems: [
      { href: "/dashboard/notifications", icon: Bell, label: "Notifikasi" },
      { href: "/dashboard/users", icon: Users, label: "Manajemen Pengguna" },
      { href: "/dashboard/logs", icon: History, label: "Log Aktivitas" },
      { href: "/dashboard/settings", icon: Settings, label: "Pengaturan Akun" },
    ],
  },
]

const reporterNavItems: NavItemType[] = [
  { href: "/dashboard/incidents", icon: ShieldAlert, label: "Insiden Keselamatan" },
  { href: "/dashboard/surveys", icon: ClipboardCheck, label: "Survei Budaya" },
]

const limitedSettingsNavItems: NavItemType[] = [
  {
    label: "Pengaturan Sistem",
    icon: Cog,
    subItems: [
      { href: "/dashboard/settings", icon: Settings, label: "Pengaturan Akun" },
    ],
  },
]

const getPrimaryNavItems = (role?: UserRole | null): NavItemType[] => {
  if (role === "Petugas Pelaporan") {
    return reporterNavItems
  }
  return baseNavItems
}

const getSystemNavItems = (role?: UserRole | null): NavItemType[] => {
  if (!role) {
    return []
  }
  if (role === "Admin Sistem") {
    return adminSystemNavItems
  }
  if (role === "Petugas Pelaporan") {
    return []
  }
  return limitedSettingsNavItems
}

const findPath = (items: NavItemType[], currentPath: string): NavItemType[] => {
  const findPathRecursive = (
    navItemsToSearch: NavItemType[]
  ): NavItemType[] => {
    for (const item of navItemsToSearch) {
      if (item.href === currentPath) {
        return [item]
      }
      if (item.subItems) {
        const subPath = findPathRecursive(item.subItems)
        if (subPath.length > 0) {
          return [item, ...subPath]
        }
      }
    }
    return []
  }

  return findPathRecursive(items)
}

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, clearCurrentUser } = useUserStore()
  const { addLog } = useLogStore()
  useRealtimeEvents(currentUser)
  const primaryNavItems = React.useMemo(
    () => getPrimaryNavItems(currentUser?.role),
    [currentUser?.role]
  )
  const systemNavItems = React.useMemo(
    () => getSystemNavItems(currentUser?.role),
    [currentUser?.role]
  )
  const combinedNavItems = React.useMemo(
    () => [...primaryNavItems, ...systemNavItems],
    [primaryNavItems, systemNavItems]
  )
  const handleLogout = React.useCallback(async () => {
    if (currentUser?.name) {
      addLog({
        user: currentUser.name,
        action: "LOGOUT",
        details: "Pengguna berhasil logout.",
      })
    }
    await logout()
    clearCurrentUser()
    router.push("/")
  }, [addLog, clearCurrentUser, currentUser, router])

  const breadcrumbPath = React.useMemo(
    () => findPath(combinedNavItems, pathname),
    [combinedNavItems, pathname]
  )
  const currentPage = breadcrumbPath[breadcrumbPath.length - 1]
  const defaultTitle = primaryNavItems[0]?.label ?? "Ringkasan Dasbor"

  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>(
    () => {
      const initialState: { [key: string]: boolean } = {}

      for (const item of breadcrumbPath) {
        if (item.subItems) {
          initialState[item.label] = true
        }
      }

      return initialState
    }
  )

  React.useEffect(() => {
    setOpenMenus((prev) => {
      let hasChanges = false
      const nextState = { ...prev }

      for (const item of breadcrumbPath) {
        if (item.subItems && !nextState[item.label]) {
          nextState[item.label] = true
          hasChanges = true
        }
      }

      return hasChanges ? nextState : prev
    })
  }, [breadcrumbPath])
  const logoutNavItem = {
    label: "Logout",
    icon: LogOut,
    onClick: handleLogout,
  }
  return (
    <>
      <SidebarProvider>
        <Sidebar
          collapsible="icon"
          className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
        >
          <SidebarHeader className="flex h-20 items-center justify-center p-4">
            <div className="flex items-center gap-2 group-data-[state=expanded]:w-full">
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 bg-primary/20 text-primary hover:bg-primary/30 group-data-[state=collapsed]:bg-transparent"
                asChild
              >
                <Link href="/dashboard/overview">
                  <Image className="size-8" src={favicon} alt="logorsud" />
                </Link>
              </Button>
              <h1 className="truncate text-xl font-semibold tracking-tight group-data-[state=collapsed]:hidden">
                SIRATU
              </h1>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {primaryNavItems.map((item, index) => (
                <NavItem
                  key={index}
                  item={item}
                  openMenus={openMenus}
                  setOpenMenus={setOpenMenus}
                />
              ))}
            </SidebarMenu>

            {systemNavItems.length > 0 && (
              <SidebarMenu className="mt-4 border-t border-sidebar-border/50 pt-2">
                {systemNavItems.map((item, index) => (
                  <NavItem
                    key={index}
                    item={item}
                    openMenus={openMenus}
                    setOpenMenus={setOpenMenus}
                  />
                ))}
              </SidebarMenu>
            )}
          </SidebarContent>

          <SidebarFooter className="mt-auto p-2">
            <SidebarMenu>
              <NavItem
                item={logoutNavItem}
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
              />
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-auto min-h-20 flex-col border-b bg-background px-4 md:px-6">
            <div className="flex w-full items-center py-3">
              <SidebarTrigger className="md:hidden" />
              <h1 className="flex-1 text-3xl font-bold">
                {currentPage?.label || defaultTitle}
              </h1>
              <div className="ml-auto flex items-center gap-2">
                <NotificationPopover />
                <UserNav />
              </div>
            </div>
            <div className="pb-3">
              <Breadcrumb navItems={combinedNavItems} />
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
