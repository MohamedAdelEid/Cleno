import { format, formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { Activity, Key, LogIn, LogOut, Settings, UserPen } from 'lucide-react'
import { memo } from 'react'

import type { ProfileActivity } from '@/domain/entities'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/presentation/components/ui/tooltip'
import { cn } from '@/presentation/utils'

interface ActivityTimelineProps {
  activities: ProfileActivity[]
  isLoading: boolean
}

const activityConfig: Record<
  ProfileActivity['type'],
  { icon: React.ElementType; color: string; bgColor: string; ringColor: string }
> = {
  login: {
    icon: LogIn,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    ringColor: 'ring-blue-500/20',
  },
  logout: {
    icon: LogOut,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-500/10',
    ringColor: 'ring-slate-500/20',
  },
  password_change: {
    icon: Key,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    ringColor: 'ring-amber-500/20',
  },
  profile_update: {
    icon: UserPen,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    ringColor: 'ring-emerald-500/20',
  },
  settings_update: {
    icon: Settings,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    ringColor: 'ring-purple-500/20',
  },
}

export const ActivityTimeline = memo(({ activities, isLoading }: ActivityTimelineProps) => {
  if (isLoading) {
    return <ActivityTimelineSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
      className="rounded-2xl border border-border/60 bg-card p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <Activity className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type]
            const Icon = config.icon
            const isLast = index === activities.length - 1

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="flex gap-4"
              >
                <div className="flex w-10 shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      'relative z-10 flex size-10 items-center justify-center rounded-full ring-4 ring-card',
                      config.bgColor,
                      config.ringColor,
                    )}
                  >
                    <Icon className={cn('size-4', config.color)} />
                  </span>
                  {!isLast && <div className="my-1 w-px flex-1 min-h-6 bg-border" />}
                </div>

                <div className={cn('min-w-0 flex-1', !isLast && 'pb-5')}>
                  <p className="text-sm font-medium leading-snug">{activity.description}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(new Date(activity.createdAt), 'PPpp')}
                      </TooltipContent>
                    </Tooltip>
                    {activity.ipAddress && <span>{activity.ipAddress}</span>}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
})

ActivityTimeline.displayName = 'ActivityTimeline'

const ActivityTimelineSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card p-6">
    <Skeleton className="mb-5 h-6 w-36" />
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
