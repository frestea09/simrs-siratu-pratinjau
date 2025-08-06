"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

type NavItem = {
  href?: string;
  label: string;
  subItems?: NavItem[];
};

type BreadcrumbProps = {
  navItems: NavItem[];
};

export function Breadcrumb({ navItems }: BreadcrumbProps) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = React.useState<{ href: string; label: string }[]>([]);

  React.useEffect(() => {
    const findPath = (items: NavItem[], currentPath: string): { href: string; label: string }[] => {
      for (const item of items) {
        if (item.href === currentPath) {
          return [{ href: item.href, label: item.label }];
        }
        if (item.subItems) {
          const subPath = findPath(item.subItems, currentPath);
          if (subPath.length > 0) {
            return [{ href: '#', label: item.label }, ...subPath];
          }
        }
      }
      return [];
    };

    const path = findPath(navItems, pathname);
    setBreadcrumbs(path);
  }, [pathname, navItems]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {index === breadcrumbs.length - 1 || crumb.href === '#' ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
