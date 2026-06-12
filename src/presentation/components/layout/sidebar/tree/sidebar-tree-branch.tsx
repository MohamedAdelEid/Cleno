import { motion } from 'framer-motion'

import { useDirection } from '@/presentation/hooks/use-direction'
import { cn } from '@/presentation/utils'
import { SUB_NAV_DURATION, SUB_NAV_EASE, SUB_NAV_STAGGER, SUB_NAV_TREE } from './sidebar-nav.constants'

interface SidebarTreeBranchProps {
  index: number
  depth?: number
}

const { ROW_HEIGHT, TRUNK_X, VERTICAL_LEN, CURVE_RADIUS, H_BRANCH } = SUB_NAV_TREE

const buildConnectorPath = (branchY: number): string => {
  const vertTop = branchY - VERTICAL_LEN
  const cornerY = branchY - CURVE_RADIUS
  const hEnd = CURVE_RADIUS + H_BRANCH

  return `M 0.5 ${vertTop} L 0.5 ${cornerY} Q 0.5 ${branchY} ${0.5 + CURVE_RADIUS} ${branchY} L ${hEnd} ${branchY}`
}

export const getTreeBranchWidth = (): number => CURVE_RADIUS + H_BRANCH

export const SidebarTreeBranch = ({ index, depth = 0 }: SidebarTreeBranchProps) => {
  const { isRtl } = useDirection()
  const trunkOffset = depth * SUB_NAV_TREE.DEPTH_INDENT
  const trunkX = TRUNK_X + trunkOffset

  const branchY = ROW_HEIGHT / 2
  const svgWidth = getTreeBranchWidth()
  const connectorPath = buildConnectorPath(branchY)
  const stagger = index * SUB_NAV_STAGGER

  return (
    <svg
      width={svgWidth}
      height={ROW_HEIGHT}
      viewBox={`0 0 ${svgWidth} ${ROW_HEIGHT}`}
      aria-hidden
      className={cn(
        'pointer-events-none shrink-0 overflow-visible text-sidebar-foreground/40',
        isRtl && 'scale-x-[-1]',
      )}
      style={{ marginInlineStart: trunkX - 1 }}
    >
      <motion.path
        d={connectorPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: SUB_NAV_DURATION, ease: SUB_NAV_EASE, delay: stagger }}
      />
    </svg>
  )
}
