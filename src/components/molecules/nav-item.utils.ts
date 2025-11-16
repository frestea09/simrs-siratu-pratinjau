import React from 'react'
import { usePathname } from 'next/navigation'
import type { NavItem as NavItemType } from '@/types/nav'

export function useActivePath(item: NavItemType) {
  const pathname = usePathname()
  return React.useMemo(() => {
    if (!item.subItems) return false
    const checkActive = (items: NavItemType[]): boolean =>
      items.some(sub => {
        if (sub.href && pathname.startsWith(sub.href)) return true
        if (sub.subItems) return checkActive(sub.subItems)
        return false
      })
    return checkActive(item.subItems)
  }, [item.subItems, pathname])
}
