import { motion } from 'framer-motion'
import { cn } from '@/presentation/utils'

interface ActivityTimelineSkeletonProps {
  count?: number
}

export const ActivityTimelineSkeleton = ({ count = 5 }: ActivityTimelineSkeletonProps) => (
  <ul className="space-y-1">
    {Array.from({ length: count }).map((_, index) => (
      <motion.li
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05, duration: 0.25 }}
        className="flex items-start gap-3 py-2.5"
      >
        <div
          className={cn(
            'size-8 shrink-0 rounded-lg bg-muted/70',
            'animate-pulse',
          )}
        />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-2/5 animate-pulse rounded-md bg-muted/70" />
          <div className="h-3 w-4/5 animate-pulse rounded-md bg-muted/50" />
        </div>
        <div className="h-3 w-12 animate-pulse rounded-md bg-muted/50" />
      </motion.li>
    ))}
  </ul>
)
