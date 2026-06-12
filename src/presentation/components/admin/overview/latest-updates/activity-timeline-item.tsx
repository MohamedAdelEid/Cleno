import { motion } from 'framer-motion'
import { cn } from '@/presentation/utils'
import type { ActivityItem } from './latest-updates.types'

const ITEM_EASE = [0.25, 0.1, 0.25, 1] as const

interface ActivityTimelineItemProps {
  item: ActivityItem
  index: number
}

export const ActivityTimelineItem = ({ item, index }: ActivityTimelineItemProps) => {
  const Icon = item.icon

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -10, filter: 'blur(3px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 10, filter: 'blur(3px)' }}
      transition={{ duration: 0.28, ease: ITEM_EASE, delay: index * 0.04 }}
      className="relative flex items-start gap-3 py-2.5"
    >
      <div
        className={cn(
          'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background',
          item.iconClassName,
        )}
      >
        <Icon className="size-3.5" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground" title={item.description}>
          {item.description}
        </p>
      </div>

      <time className="shrink-0 pt-0.5 text-xs text-muted-foreground/80">{item.time}</time>
    </motion.li>
  )
}
