import { motion } from 'framer-motion'

import { Skeleton } from '@/presentation/components/ui/skeleton'
import { fadeUp } from '@/presentation/utils/motion'

interface PermissionsSkeletonProps {
  groupCount?: number
}

const PermissionGroupSkeleton = ({
  index,
  expanded = false,
}: {
  index: number
  expanded?: boolean
}) => (
  <motion.div
    {...fadeUp(index * 0.06)}
    className="overflow-hidden rounded-xl border border-border/70 bg-background"
  >
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="min-w-0 flex-1 space-y-2.5">
        <Skeleton className="h-5 w-28 sm:w-36" />
        <Skeleton className="h-4 w-44 sm:w-56" />
      </div>
      <Skeleton className="size-8 shrink-0 rounded-full" />
    </div>

    {expanded ? (
      <div className="border-t border-border/60 px-4 py-4">
        <Skeleton className="mb-4 h-5 w-24" />
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, itemIndex) => (
            <Skeleton key={itemIndex} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    ) : null}
  </motion.div>
)

export const PermissionsSkeleton = ({ groupCount = 4 }: PermissionsSkeletonProps) => (
  <div className="space-y-3" aria-hidden>
    {Array.from({ length: groupCount }).map((_, index) => (
      <PermissionGroupSkeleton key={index} index={index} expanded={index === 0} />
    ))}
  </div>
)
