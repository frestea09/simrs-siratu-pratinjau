
"use client";

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
} from "@/components/ui/sidebar";
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
} from "lucide-react";
import Link from "next/link";
import favicon from "@/app/favicon.ico";
import { usePathname, useRouter } from "next/navigation";
import { UserNav } from "@/components/user-nav";
import React from "react";
import { Breadcrumb } from "@/components/molecules/breadcrumb";
import { useUserStore } from "@/store/user-store.tsx";
import { useLogStore } from "@/store/log-store.tsx";
import { NavItem as NavItemType } from "@/types/nav";
import { NavItem } from "./molecules/nav-item";
import { cn } from "@/lib/utils";
import { NotificationPopover } from "./organisms/notification-popover";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { logout } from "@/lib/actions/auth";

const navItems: NavItemType[] = [
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
          { href: "/dashboard/impu", icon: Network, label: "IMPU" },
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
];

const adminNavItems: NavItemType[] = [
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
];

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, clearCurrentUser } = useUserStore();
  const { addLog } = useLogStore();
  const currentUserName = currentUser?.name;

  const handleLogout = React.useCallback(async () => {
    if (currentUserName) {
      addLog({
        user: currentUserName,
        action: "LOGOUT",
        details: "Pengguna berhasil logout.",
      });
    }
    await logout();
    clearCurrentUser();
    router.push("/");
  }, [addLog, clearCurrentUser, currentUserName, router]);

  const findPath = React.useCallback(
    (items: NavItemType[], currentPath: string): NavItemType[] => {
      const findPathRecursive = (navItemsToSearch: NavItemType[]): NavItemType[] => {
        for (const item of navItemsToSearch) {
          if (item.href === currentPath) {
            return [item];
          }
          if (item.subItems) {
            const subPath = findPathRecursive(item.subItems);
            if (subPath.length > 0) {
              return [item, ...subPath];
            }
          }
        }
        return [];
      };

      return findPathRecursive(items);
    },
    [],
  );

  const allNavItems = React.useMemo(() => {
    const fullNav = JSON.parse(JSON.stringify(navItems)) as NavItemType[];
    if (fullNav[1]?.subItems?.[1]?.subItems?.[3]) {
      fullNav[1].subItems[1].subItems[3].label =
        "Indikator Mutu Prioritas Unit (IMPU)";
    }
    return fullNav.concat(adminNavItems);
  }, []);

  const breadcrumbPath = React.useMemo(
    () => findPath(allNavItems, pathname),
    [allNavItems, findPath, pathname],
  );
  const currentPage = React.useMemo(
    () => breadcrumbPath[breadcrumbPath.length - 1],
    [breadcrumbPath],
  );
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>(
    {}
  );
  const logoutNavItem = React.useMemo(
    () => ({
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
    }),
    [handleLogout],
  );
  return (
    <>
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
                  <Image className="size-8" src={favicon} alt="logorsud" />
                </Link>
              </Button>
              <h1 className="text-xl font-semibold tracking-tight truncate group-data-[state=collapsed]:hidden">
                SIRATU
              </h1>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item, index) => (
                <NavItem
                  key={index}
                  item={item}
                  openMenus={openMenus}
                  setOpenMenus={setOpenMenus}
                />
              ))}
            </SidebarMenu>

            {currentUser?.name === "Admin Sistem" && (
              <SidebarMenu className="mt-4 pt-2 border-t border-sidebar-border/50">
                {adminNavItems.map((item, index) => (
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

          <SidebarFooter className="p-2 mt-auto">
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
            <div className="flex items-center w-full py-3">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-3xl font-bold flex-1">
                {currentPage?.label || "Ringkasan Dasbor"}
              </h1>
              <div className="ml-auto flex items-center gap-2">
                <NotificationPopover />
                <UserNav />
              </div>
            </div>
            <div className="pb-3">
              <Breadcrumb navItems={allNavItems} />
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
