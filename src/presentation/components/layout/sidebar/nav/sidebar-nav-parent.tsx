import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { useIsNavItemActive, useIsSidebarRouteActive } from '@/presentation/hooks/use-active-nav-href'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import type { NavigationItem } from '@/presentation/navigation'
import { cn } from '@/presentation/utils'
import { createItemVariants, SIDEBAR_DURATION, SIDEBAR_EASE } from '../animations'
import { SUB_NAV_DURATION, SUB_NAV_EASE, SUB_NAV_TREE } from '../tree/sidebar-nav.constants'
import { SidebarSubItem } from '../tree/sidebar-sub-item'

interface SidebarNavParentProps {
  item: NavigationItem
  label: string
  index: number
  isCollapsed: boolean
  onNavigate?: () => void
}

const CollapsedNavLink = ({
  item,
  depth,
  onNavigate,
}: {
  item: NavigationItem
  depth: number
  onNavigate?: () => void
}) => {
  const { t } = useTranslation('navigation')
  const isActive = useIsSidebarRouteActive(item.href)

  if (!item.href) return null

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2 rounded-lg py-2 text-sm transition-colors',
        isActive ? 'font-medium text-primary' : 'text-foreground hover:bg-muted',
      )}
      style={{ paddingInlineStart: `${10 + depth * 12}px`, paddingInlineEnd: '10px' }}
    >
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full border',
          isActive ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-transparent',
        )}
      />
      {t(item.titleKey)}
    </Link>
  )
}

const CollapsedNavGroup = ({
  item,
  depth,
  onNavigate,
}: {
  item: NavigationItem
  depth: number
  onNavigate?: () => void
}) => {
  const { t } = useTranslation('navigation')

  if (!item.children?.length) return null

  return (
    <div className="space-y-0.5">
      <p
        className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground"
        style={{ paddingInlineStart: `${10 + depth * 12}px` }}
      >
        {t(item.titleKey)}
      </p>
      {item.children.map((child) =>
        child.children?.length ? (
          <CollapsedNavGroup key={child.titleKey} item={child} depth={depth + 1} onNavigate={onNavigate} />
        ) : (
          <CollapsedNavLink key={child.titleKey} item={child} depth={depth + 1} onNavigate={onNavigate} />
        ),
      )}
    </div>
  )
}

export const SidebarNavParent = ({
  item,
  label,
  index,
  isCollapsed,
  onNavigate,
}: SidebarNavParentProps) => {
  const { isRtl } = useDirection()
  const { t } = useTranslation('navigation')
  const Icon = item.icon
  const children = item.children ?? []
  const hasActiveChild = useIsNavItemActive(item)
  const itemVariants = createItemVariants(isRtl)

  const [expanded, setExpanded] = useState(hasActiveChild)

  useEffect(() => {
    if (hasActiveChild) setExpanded(true)
  }, [hasActiveChild])

  const toggleExpanded = () => setExpanded((current) => !current)

  const parentButtonClass = cn(
    'flex w-full items-center gap-3 rounded-xl border border-transparent p-3 transition-colors duration-300',
    'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
    isCollapsed && 'justify-center px-2',
    hasActiveChild
      ? 'border-sidebar-border/60 bg-sidebar-accent/40 text-sidebar-accent-foreground'
      : 'text-sidebar-foreground hover:border-sidebar-border/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  )

  const collapsedContent = (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={label} className={parentButtonClass}>
          <Icon className="size-6 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={isRtl ? 'left' : 'right'}
        align="start"
        className="w-52 p-2"
        sideOffset={8}
      >
        <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">{label}</p>
        <div className="space-y-0.5">
          {children.map((child) =>
            child.children?.length ? (
              <CollapsedNavGroup key={child.titleKey} item={child} depth={0} onNavigate={onNavigate} />
            ) : (
              <CollapsedNavLink key={child.titleKey} item={child} depth={0} onNavigate={onNavigate} />
            ),
          )}
        </div>
      </PopoverContent>
    </Popover>
  )

  const expandedContent = (
    <div>
      <button
        type="button"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        className={parentButtonClass}
      >
        <Icon className="size-6 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-start text-sm font-medium">{label}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: SUB_NAV_DURATION, ease: SUB_NAV_EASE }}
          className="flex shrink-0 items-center justify-center text-sidebar-foreground/60"
        >
          <ChevronDown className="size-4" strokeWidth={2.25} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: SUB_NAV_DURATION, ease: SUB_NAV_EASE }}
            className="overflow-hidden"
          >
            <LayoutGroup id={item.titleKey}>
              <div
                className="flex flex-col pb-0.5"
                style={{ gap: SUB_NAV_TREE.ITEM_GAP, paddingTop: SUB_NAV_TREE.ITEM_GAP }}
              >
                <AnimatePresence initial={false}>
                  {children.map((child, childIndex) => (
                    <SidebarSubItem
                      key={child.titleKey}
                      item={child}
                      label={t(child.titleKey)}
                      groupId={item.titleKey}
                      index={childIndex}
                      onNavigate={onNavigate}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      transition={{ duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }}
    >
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{collapsedContent}</TooltipTrigger>
          <TooltipContent side={isRtl ? 'left' : 'right'} sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      ) : (
        expandedContent
      )}
    </motion.div>
  )
}
