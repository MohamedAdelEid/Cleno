import { motion } from 'framer-motion'

import { DriverStatus } from '@/domain/enums'
import type { ActiveDriver } from '@/domain/entities'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { cn } from '@/presentation/utils'

const ITEM_EASE = [0.25, 0.1, 0.25, 1] as const

interface ActiveDriverItemProps {
  driver: ActiveDriver
  index: number
  idleLabel: string
  onTaskLabel: string
  tasksCountLabel?: string
  onClick?: (driver: ActiveDriver) => void
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const ActiveDriverItem = ({
  driver,
  index,
  idleLabel,
  onTaskLabel,
  tasksCountLabel,
  onClick,
}: ActiveDriverItemProps) => {
  const isIdle = driver.status === DriverStatus.Idle
  const isOnTask = driver.status === DriverStatus.OnTask

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: ITEM_EASE, delay: index * 0.06 + 0.12 }}
    >
      <button
        type="button"
        onClick={() => onClick?.(driver)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-start transition-colors',
          'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        )}
      >
        <div className="relative shrink-0">
          {isIdle && (
            <>
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-amber-400/35"
                animate={{ scale: [1, 1.45, 1], opacity: [0.45, 0, 0.45] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-amber-400/10"
                animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.15, 0.35] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              />
            </>
          )}

          {isOnTask && (
            <motion.span
              aria-hidden
              className="absolute -inset-1 rounded-full bg-emerald-500/12"
              animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.2, 0.55] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <Avatar size="sm" className="relative z-10">
            <AvatarImage src={driver.avatarUrl ?? undefined} alt={driver.fullName} />
            <AvatarFallback className="text-[10px]">
              {getInitials(driver.fullName)}
            </AvatarFallback>
          </Avatar>

          {isOnTask && (
            <span className="absolute end-0 bottom-0 z-20 flex size-2.5 items-center justify-center">
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-emerald-500/40"
                animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              />
              <span className="relative size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{driver.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {isIdle ? (
              idleLabel
            ) : (
              <>
                {onTaskLabel}
                {driver.activeTask && (
                  <>
                    {' · '}
                    <span className="font-medium text-foreground/80">{driver.activeTask}</span>
                  </>
                )}
                {driver.taskCount && driver.taskCount > 1 && tasksCountLabel && (
                  <span className="ms-1 text-muted-foreground/80">
                    ({tasksCountLabel})
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </button>
    </motion.li>
  )
}
