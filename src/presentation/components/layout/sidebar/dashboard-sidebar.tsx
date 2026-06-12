import { motion } from 'framer-motion'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useSidebarNavigation } from '@/presentation/hooks/use-sidebar-navigation'
import { countNavItems } from '@/presentation/navigation/navigation.helpers'
import { cn, smoothScrollClass } from '@/presentation/utils'
import {
  createMobileSidebarVariants,
  createSidebarVariants,
  SIDEBAR_DURATION,
  SIDEBAR_EASE,
} from './animations'
import { SidebarHeader } from './sidebar-header'
import { SidebarNavGroup } from './nav/sidebar-nav-group'
import { SidebarFooter } from './nav/sidebar-footer'
import { SidebarRail } from './sidebar-rail'
import { SidebarSearch } from './sidebar-search'

interface DashboardSidebarProps {
  isCollapsed: boolean
  isMobile: boolean
  onToggle: () => void
  onNavigate?: () => void
}

export const DashboardSidebar = ({
  isCollapsed,
  isMobile,
  onToggle,
  onNavigate,
}: DashboardSidebarProps) => {
  const { isRtl } = useDirection()
  const { main: mainNavigation, footer: footerNavigation } = useSidebarNavigation()

  const variants = isMobile ? createMobileSidebarVariants(isRtl) : createSidebarVariants(isRtl)
  const animateState = isMobile ? 'visible' : isCollapsed ? 'collapsed' : 'expanded'
  const initialState = isMobile ? 'hidden' : 'initial'

  let itemOffset = 0

  return (
    <motion.aside
      initial={initialState}
      animate={animateState}
      exit={isMobile ? 'hidden' : undefined}
      variants={variants}
      transition={
        isMobile
          ? { type: 'spring', damping: 26, stiffness: 260 }
          : { duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }
      }
      className={cn(
        'z-50 flex h-dvh max-h-dvh shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground',
        'border-e border-sidebar-border',
        isMobile
          ? 'fixed inset-y-0 inset-inline-start-0 shadow-lg'
          : 'relative',
        !isCollapsed ? 'px-4' : 'px-3',
      )}
    >
      {!isMobile && <SidebarRail isCollapsed={isCollapsed} isRtl={isRtl} onToggle={onToggle} />}

      <div className="z-10 shrink-0 bg-sidebar">
        <SidebarHeader isCollapsed={isCollapsed && !isMobile} onToggle={onToggle} />
        <SidebarSearch isCollapsed={isCollapsed && !isMobile} />
      </div>

      <nav
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-4 py-5',
          smoothScrollClass,
        )}
      >
        {mainNavigation.map((group, index) => {
          const groupElement = (
            <SidebarNavGroup
              key={group.titleKey ?? `group-${index}`}
              group={group}
              startIndex={itemOffset}
              isCollapsed={isCollapsed && !isMobile}
              onNavigate={onNavigate}
            />
          )
          itemOffset += countNavItems(group.items)
          return groupElement
        })}
      </nav>

      <SidebarFooter
        groups={footerNavigation}
        isCollapsed={isCollapsed && !isMobile}
        startIndex={itemOffset}
        onNavigate={onNavigate}
      />
    </motion.aside>
  )
}
