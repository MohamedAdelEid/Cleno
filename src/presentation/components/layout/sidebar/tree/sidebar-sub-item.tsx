import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useIsNavItemActive, useIsSidebarRouteActive } from '@/presentation/hooks/use-active-nav-href'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import type { NavigationItem } from '@/presentation/navigation'
import { cn } from '@/presentation/utils'
import { SUB_NAV_DURATION, SUB_NAV_EASE, SUB_NAV_STAGGER, SUB_NAV_TREE } from './sidebar-nav.constants'
import { SidebarSubActiveNode } from './sidebar-sub-active-node'
import { SidebarTreeBranch } from './sidebar-tree-branch'

interface SidebarSubItemProps {
  item: NavigationItem
  label: string
  groupId: string
  depth?: number
  index: number
  onNavigate?: () => void
}

export const SidebarSubItem = ({
  item,
  label,
  groupId,
  depth = 0,
  index,
  onNavigate,
}: SidebarSubItemProps) => {
  const { isRtl } = useDirection()
  const { t } = useTranslation('navigation')
  const hasChildren = Boolean(item.children?.length)
  const isActive = useIsSidebarRouteActive(item.href)
  const hasActiveDescendant = useIsNavItemActive(item)
  const [expanded, setExpanded] = useState(hasActiveDescendant)
  const nestedGroupId = `${groupId}/${item.titleKey}`

  useEffect(() => {
    if (hasActiveDescendant) setExpanded(true)
  }, [hasActiveDescendant])

  if (hasChildren) {
    const children = item.children ?? []

    return (
      <motion.div
        initial={{ opacity: 0, x: isRtl ? 6 : -6 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRtl ? 4 : -4 }}
        transition={{
          duration: SUB_NAV_DURATION,
          ease: SUB_NAV_EASE,
          delay: index * SUB_NAV_STAGGER,
        }}
        className="relative"
        style={{ minHeight: SUB_NAV_TREE.ROW_HEIGHT }}
      >
        <div
          className="flex items-center"
          style={{ minHeight: SUB_NAV_TREE.ROW_HEIGHT }}
        >
          <div className="flex shrink-0 items-center">
            <SidebarTreeBranch index={index} depth={depth} />
            <SidebarSubActiveNode isActive={false} groupId={nestedGroupId} />
          </div>

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            className={cn(
              'ms-2.5 flex min-w-0 flex-1 items-center gap-2 pe-2 text-sm font-medium transition-colors duration-300',
              'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground',
              'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
            )}
            style={{ minHeight: SUB_NAV_TREE.ROW_HEIGHT }}
          >
            <span className="truncate">{label}</span>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: SUB_NAV_DURATION, ease: SUB_NAV_EASE }}
              className="ms-auto shrink-0 text-sidebar-foreground/45"
            >
              <ChevronDown className="size-3.5" strokeWidth={2.25} />
            </motion.span>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: SUB_NAV_DURATION, ease: SUB_NAV_EASE }}
              className="overflow-hidden"
            >
              <LayoutGroup id={nestedGroupId}>
                <div
                  className="flex flex-col"
                  style={{ gap: SUB_NAV_TREE.ITEM_GAP, paddingTop: SUB_NAV_TREE.ITEM_GAP }}
                >
                  {children.map((child, childIndex) => (
                    <SidebarSubItem
                      key={child.titleKey}
                      item={child}
                      label={t(child.titleKey)}
                      groupId={nestedGroupId}
                      depth={depth + 1}
                      index={childIndex}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </LayoutGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (!item.href) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: isRtl ? 6 : -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 4 : -4 }}
      transition={{
        duration: SUB_NAV_DURATION,
        ease: SUB_NAV_EASE,
        delay: index * SUB_NAV_STAGGER,
      }}
      className="flex items-center"
      style={{ minHeight: SUB_NAV_TREE.ROW_HEIGHT }}
    >
      <div className="flex shrink-0 items-center">
        <SidebarTreeBranch index={index} depth={depth} />
        <SidebarSubActiveNode isActive={isActive} groupId={groupId} />
      </div>

      <motion.div
        whileHover={{ x: isRtl ? -4 : 4 }}
        transition={{ duration: 0.22, ease: SUB_NAV_EASE }}
        className="ms-2.5 min-w-0 flex-1"
      >
        <Link
          to={item.href}
          onClick={onNavigate}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'flex items-center pe-2 text-sm font-medium transition-colors duration-300',
            'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
            isActive
              ? 'text-primary'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground',
          )}
          style={{ minHeight: SUB_NAV_TREE.ROW_HEIGHT }}
        >
          <span className="truncate">{label}</span>
        </Link>
      </motion.div>
    </motion.div>
  )
}
