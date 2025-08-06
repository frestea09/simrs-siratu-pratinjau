
"use client"

import React from 'react';
import Link from 'next/link';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';

type NavItemType = {
  href?: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  subItems?: NavItemType[];
}

type NavItemProps = {
  item: NavItemType;
  pathname: string;
  openMenu: string | null;
  setOpenMenu: (label: string | null) => void;
};

export function NavItem({ item, pathname, openMenu, setOpenMenu }: NavItemProps) {
  const isParentActive = item.subItems?.some((subItem: any) => pathname.startsWith(subItem.href));
  const isOpen = openMenu === item.label;

  const handleClick = () => {
    if (item.subItems) {
      setOpenMenu(isOpen ? null : item.label);
    } else if (item.onClick) {
      item.onClick();
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

  const buttonContent = (
    <SidebarMenuButton
        as={item.href ? 'a' : 'button'}
        isActive={item.href ? pathname.startsWith(item.href) : false}
        tooltip={item.label}
        size="lg"
        onClick={item.onClick}
    >
        <div>
            <item.icon className="size-6" />
            <span>{item.label}</span>
        </div>
    </SidebarMenuButton>
  );

  return (
    <SidebarMenuItem>
       {item.href ? (
         <Link href={item.href} passHref legacyBehavior>
           {buttonContent}
         </Link>
       ) : (
         buttonContent
       )}
    </SidebarMenuItem>
  );
}
