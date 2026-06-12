import { AnimatePresence } from 'framer-motion'
import { Outlet } from 'react-router-dom'
import { DashboardContent } from '@/presentation/components/layout/dashboard-content'
import { DashboardSidebar, MobileOverlay } from '@/presentation/components/layout/sidebar'
import { useDashboardSidebarState } from '@/presentation/hooks/use-dashboard-sidebar-state'
import { useIsMobile } from '@/presentation/hooks/use-mobile'
export const DashboardLayout = () => {
  const isMobile = useIsMobile()
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useDashboardSidebarState(isMobile)

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-background">
      <AnimatePresence>
        {isMobile && isMobileOpen && <MobileOverlay onClick={closeMobile} />}
      </AnimatePresence>

      <AnimatePresence>
        {(!isMobile || isMobileOpen) && (
          <DashboardSidebar
            key="dashboard-sidebar"
            isCollapsed={isMobile ? false : isCollapsed}
            isMobile={isMobile}
            onToggle={isMobile ? closeMobile : toggle}
            onNavigate={isMobile ? closeMobile : undefined}
          />
        )}
      </AnimatePresence>

      <DashboardContent
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        onMobileMenuToggle={toggle}
      >
        <Outlet />
      </DashboardContent>
    </div>
  )
}
