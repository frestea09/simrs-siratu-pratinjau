
"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { NavItemProps } from './nav-item.type'
import { useActivePath } from './nav-item.utils'

const NavSubMenu = ({ item, openMenus, setOpenMenus, isSubItem }: NavItemProps) => {
  const { label, icon: Icon, subItems } = item
  const isParentActive = useActivePath(item)
  const isOpen = openMenus[label] || false

  React.useEffect(() => {
    if (isParentActive && !isOpen) {
      setOpenMenus(prev => ({ ...prev, [label]: true }))
    }
  }, [isParentActive, isOpen, label, setOpenMenus])

  const handleToggle = React.useCallback(() => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }))
  }, [label, setOpenMenus])

  const content = (
    <>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="size-6" />}
        <span>{label}</span>
      </div>
      <ChevronDown
        className={`ml-auto size-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </>
  )

  return (
    <>
      {isSubItem ? (
        <SidebarMenuSubButton
          size="sm"
          onClick={handleToggle}
          isActive={isParentActive}
          className={cn('w-full justify-between', 'h-10')}
        >
          {content}
        </SidebarMenuSubButton>
      ) : (
        <SidebarMenuButton
          size="lg"
          onClick={handleToggle}
          isActive={isParentActive}
          tooltip={label}
          className={cn('w-full justify-between')}
        >
          {content}
        </SidebarMenuButton>
      )}
      <SidebarMenuSub className={cn('mt-1 pr-0', isSubItem ? 'pl-4' : '')}>
        {isOpen &&
          subItems?.map((subItem, index) => (
            <NavItem
              key={index}
              item={subItem}
              openMenus={openMenus}
              setOpenMenus={setOpenMenus}
              isSubItem
            />
          ))}
      </SidebarMenuSub>
    </>
  )
}

const NavLink = ({ item, isSubItem }: Pick<NavItemProps, "item" | "isSubItem">) => {
  const pathname = usePathname()
  const isActive = item.href ? pathname.startsWith(item.href) : false
  const children = (
    <div className="flex flex-row gap-4">
      {item.icon && <item.icon className={cn(isSubItem ? "size-5" : "size-6")} />}
      <span>{item.label}</span>
    </div>
  )

  if (isSubItem) {
    if (item.href) {
      return (
        <SidebarMenuSubButton isActive={isActive} onClick={item.onClick} asChild>
          <Link href={item.href}>{children}</Link>
        </SidebarMenuSubButton>
      )
    }
    return (
      <SidebarMenuSubButton isActive={isActive} onClick={item.onClick} type="button">
        {children}
      </SidebarMenuSubButton>
    )
  }

  return (
    <SidebarMenuButton
      isActive={isActive}
      tooltip={item.label}
      size="lg"
      onClick={item.onClick}
      asChild={!!item.href}
    >
      {item.href ? (
        <Link href={item.href}>
          <div className="flex items-center gap-3">{children}</div>
        </Link>
      ) : (
        <div className="flex items-center gap-3">{children}</div>
      )}
    </SidebarMenuButton>
  )
}

export function NavItem(props: NavItemProps) {
  const WrapperComponent = props.isSubItem ? SidebarMenuSubItem : SidebarMenuItem;

  return (
    <WrapperComponent>
      {props.item.subItems ? <NavSubMenu {...props} /> : <NavLink {...props} />}
    </WrapperComponent>
  );
}
