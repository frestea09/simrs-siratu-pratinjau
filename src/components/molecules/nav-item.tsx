
"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { NavItem as NavItemType } from '@/types/nav';

type NavItemProps = {
  item: NavItemType;
  openMenus: { [key: string]: boolean };
  setOpenMenus: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  isSubItem?: boolean;
};

const useActivePath = (item: NavItemType) => {
    const pathname = usePathname();
    return React.useMemo(() => {
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
};

const NavSubMenu = ({ item, openMenus, setOpenMenus, isSubItem }: NavItemProps) => {
  const isParentActive = useActivePath(item);
  const isOpen = openMenus[item.label] || false;
  const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;

  React.useEffect(() => {
    if (isParentActive && !isOpen) {
        setOpenMenus(prev => ({...prev, [item.label]: true}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParentActive, item.label]);

  return (
    <>
      <ButtonComponent
        onClick={() => setOpenMenus(prev => ({ ...prev, [item.label]: !isOpen }))}
        isActive={isParentActive}
        tooltip={item.label}
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
        {isOpen && item.subItems?.map((subItem, index) => (
          <NavItem key={index} item={subItem} openMenus={openMenus} setOpenMenus={setOpenMenus} isSubItem={true} />
        ))}
      </SidebarMenuSub>
    </>
  );
};

const NavLink = ({ item, isSubItem }: Pick<NavItemProps, 'item' | 'isSubItem'>) => {
    const pathname = usePathname();
    const commonProps = {
      isActive: item.href ? pathname.startsWith(item.href) : false,
      tooltip: item.label,
      size: isSubItem ? 'default' : 'lg' as 'default' | 'sm' | 'lg' | null | undefined,
      onClick: item.onClick,
    };
    const children = (
      <>
        {item.icon && <item.icon className={cn(isSubItem ? "size-5" : "size-6")} />}
        <span>{item.label}</span>
      </>
    );

    if (isSubItem) {
        return (
            <SidebarMenuSubButton {...commonProps} asChild={!!item.href} as={item.href ? 'a' : 'button'}>
              {item.href ? <Link href={item.href}>{children}</Link> : <button type="button">{children}</button>}
            </SidebarMenuSubButton>
        )
    }

    return (
      <SidebarMenuButton {...commonProps} asChild={!!item.href}>
        <Link href={item.href || '#'}>
          <div className="flex items-center gap-3">{children}</div>
        </Link>
      </SidebarMenuButton>
    );
}

export function NavItem(props: NavItemProps) {
  const WrapperComponent = props.isSubItem ? SidebarMenuSubItem : SidebarMenuItem;

  return (
    <WrapperComponent>
      {props.item.subItems ? <NavSubMenu {...props} /> : <NavLink {...props} />}
    </WrapperComponent>
  );
}
