import { motion } from 'framer-motion'

import { cn } from '@/presentation/utils'
import { SUB_NAV_TREE } from './sidebar-nav.constants'

const NODE_SIZE = SUB_NAV_TREE.NODE_RADIUS * 2

interface SidebarSubActiveNodeProps {
  isActive: boolean
  groupId: string
}

export const SidebarSubActiveNode = ({ isActive, groupId }: SidebarSubActiveNodeProps) => {
  const baseClass = 'box-border block shrink-0 rounded-full'

  if (isActive) {
    return (
      <motion.span
        layoutId={`sidebar-sub-active-node-${groupId}`}
        className={cn(baseClass, 'border-2 border-primary bg-primary')}
        style={{ width: NODE_SIZE, height: NODE_SIZE, marginInlineStart: -1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.75 }}
      />
    )
  }

  return (
    <span
      className={cn(baseClass, 'border-[1.5px] border-sidebar-foreground/40 bg-sidebar')}
      style={{ width: NODE_SIZE, height: NODE_SIZE, marginInlineStart: -1 }}
    />
  )
}
