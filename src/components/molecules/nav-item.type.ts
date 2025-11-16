import type React from 'react'
import type { NavItem as NavItemType } from '@/types/nav'

export interface NavItemProps {
  item: NavItemType
  openMenus: Record<string, boolean>
  setOpenMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  isSubItem?: boolean
}
