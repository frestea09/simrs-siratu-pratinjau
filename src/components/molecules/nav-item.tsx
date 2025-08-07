
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
import { NavItem as NavItemType } from '@/types/nav';
import { cn } from '@/lib/utils';

type NavItemProps = {
  item: NavItemType;
  pathname: string;
  openMenus: { [key: string]: boolean };
  setOpenMenus: (menus: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void;
  isSubItem?: boolean;
};

export function NavItem({ item, pathname, openMenus, setOpenMenus, isSubItem = false }: NavItemProps) {
  const isParentActive = item.subItems?.some((subItem: any) => pathname.startsWith(subItem.href) || subItem.subItems?.some((subSub: any) => pathname.startsWith(subSub.href)));
  const isOpen = openMenus[item.label] || false;

  const handleClick = () => {
    if (item.subItems) {
      setOpenMenus(prev => ({ ...prev, [item.label]: !isOpen }));
    } else if (item.onClick) {
      item.onClick();
    }
  };

  if (item.subItems) {
    const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
    
    return (
      <SidebarMenuItem>
        <ButtonComponent
          onClick={handleClick}
          isActive={isParentActive}
          tooltip={item.label}
          asChild={false}
          size={isSubItem ? 'default' : 'lg'}
          className={cn(
            'w-full justify-between',
             isSubItem ? 'h-10' : ''
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon && <item.icon className="size-6" />}
            <span>{item.label}</span>
          </div>
           <ChevronDown className={`ml-auto size-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </ButtonComponent>
        <SidebarMenuSub className={cn("mt-1 pr-0", isSubItem ? 'pl-4' : '')}>
          {isOpen && item.subItems.map((subItem, index) => (
             <NavItem key={index} item={subItem} pathname={pathname} openMenus={openMenus} setOpenMenus={setOpenMenus} isSubItem={true} />
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
        <div className="flex items-center gap-3">
            {item.icon && <item.icon className="size-6" />}
            <span>{item.label}</span>
        </div>
    </SidebarMenuButton>
  );

  const subButtonContent = (
     <Link href={item.href || '#'} passHref legacyBehavior>
        <SidebarMenuSubButton as="a" isActive={item.href ? pathname.startsWith(item.href) : false}>
             {item.icon && <item.icon className="size-5" />}
            <span>{item.label}</span>
        </SidebarMenuSubButton>
    </Link>
  );


  if (isSubItem) {
      return <SidebarMenuSubItem>{subButtonContent}</SidebarMenuSubItem>
  }

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
