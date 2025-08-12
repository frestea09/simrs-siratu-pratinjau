
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
import { usePathname } from 'next/navigation';

type NavItemProps = {
  item: NavItemType;
  openMenus: { [key: string]: boolean };
  setOpenMenus: (menus: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void;
  isSubItem?: boolean;
};

export function NavItem({ item, openMenus, setOpenMenus, isSubItem = false }: NavItemProps) {
  const pathname = usePathname();

  const isParentActive = React.useMemo(() => {
    if (!item.subItems) return false;
    const checkActive = (items: NavItemType[]): boolean => {
        return items.some(sub => {
            if (sub.href && pathname.startsWith(sub.href)) return true;
            if (sub.subItems) return checkActive(sub.subItems);
            return false;
        });
    }
    return checkActive(item.subItems);
  }, [item.subItems, pathname]);

  const isOpen = openMenus[item.label] || false;

  const handleClick = (e: React.MouseEvent) => {
    if (item.subItems) {
      e.preventDefault();
      setOpenMenus(prev => ({ ...prev, [item.label]: !isOpen }));
    } else if (item.onClick) {
      item.onClick();
    }
  };

  React.useEffect(() => {
    if (isParentActive && !isOpen) {
        setOpenMenus(prev => ({...prev, [item.label]: true}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParentActive, item.label, setOpenMenus]);
  
  const renderContent = () => {
    if (item.subItems) {
      const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
      return (
        <>
          <ButtonComponent
            onClick={handleClick}
            isActive={isParentActive}
            tooltip={item.label}
            asChild={false}
            size={isSubItem ? 'default' : 'lg'}
            className={cn('w-full justify-between', isSubItem ? 'h-10' : '')}
          >
            <div className="flex items-center gap-3">
              {item.icon && <item.icon className="size-6" />}
              <span>{item.label}</span>
            </div>
            <ChevronDown className={`ml-auto size-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </ButtonComponent>
          <SidebarMenuSub className={cn("mt-1 pr-0", isSubItem ? 'pl-4' : '')}>
            {isOpen && item.subItems.map((subItem, index) => (
              <NavItem key={index} item={subItem} openMenus={openMenus} setOpenMenus={setOpenMenus} isSubItem={true} />
            ))}
          </SidebarMenuSub>
        </>
      );
    }
    
    const commonProps = {
      isActive: item.href ? pathname.startsWith(item.href) : false,
      tooltip: item.label,
      size: isSubItem ? 'default' : 'lg',
      onClick: item.onClick,
    };
    const commonChildren = (
      <>
        {item.icon && <item.icon className={cn(isSubItem ? "size-5" : "size-6")} />}
        <span>{item.label}</span>
      </>
    );

    if (isSubItem) {
        return (
            <SidebarMenuSubButton {...commonProps}>
              {commonChildren}
            </SidebarMenuSubButton>
        )
    }

    return (
      <SidebarMenuButton {...commonProps} asChild={!!item.href}>
        {item.href ? (
          <Link href={item.href}>
            <div className="flex items-center gap-3">
              {commonChildren}
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            {commonChildren}
          </div>
        )}
      </SidebarMenuButton>
    );
  };

  const WrapperComponent = isSubItem ? SidebarMenuSubItem : SidebarMenuItem;

  return (
    <WrapperComponent>
      {renderContent()}
    </WrapperComponent>
  );
}
