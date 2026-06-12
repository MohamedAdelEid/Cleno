import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { useDirection } from '@/presentation/hooks/use-direction'
import type { NavigationItem } from '@/presentation/navigation'
import { cn } from '@/presentation/utils'
import { createItemVariants, SIDEBAR_DURATION, SIDEBAR_EASE, textVariants } from '../animations'

interface SidebarNavItemProps {
  item: NavigationItem
  label: string
  index: number
  isCollapsed: boolean
  isActive: boolean
  onNavigate?: () => void
}

export const SidebarNavItem = ({
  item,
  label,
  index,
  isCollapsed,
  isActive,
  onNavigate,
}: SidebarNavItemProps) => {
  const { isRtl } = useDirection()
  const Icon = item.icon
  const itemVariants = createItemVariants(isRtl)

  const linkClassName = cn(
    'flex w-full items-center gap-3 rounded-xl border border-transparent p-3 transition-colors duration-300',
    'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
    isCollapsed && 'justify-center px-2',
    isActive
      ? 'border-sidebar-border/60 bg-sidebar-accent/40 text-sidebar-accent-foreground'
      : 'text-sidebar-foreground hover:border-sidebar-border/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  )

  if (!item.href) return null

  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={linkClassName}
    >
      <Icon className="size-6 shrink-0" />
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span
            key="label"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="truncate text-sm font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
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
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side={isRtl ? 'left' : 'right'} sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </motion.div>
  )
}
