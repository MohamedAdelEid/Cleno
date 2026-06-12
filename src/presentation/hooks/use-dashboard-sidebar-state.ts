import { useEffect, useState } from 'react'

interface DashboardSidebarState {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggle: () => void
  closeMobile: () => void
}

export const useDashboardSidebarState = (isMobile: boolean): DashboardSidebarState => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (isMobile) setIsCollapsed(true)
  }, [isMobile])

  const toggle = () => {
    if (isMobile) {
      setIsMobileOpen((open) => !open)
      return
    }
    setIsCollapsed((collapsed) => !collapsed)
  }

  const closeMobile = () => setIsMobileOpen(false)

  return { isCollapsed, isMobileOpen, toggle, closeMobile }
}
