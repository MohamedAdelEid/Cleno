import { format, formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { Globe, Key, Laptop, LogOut, Monitor, Smartphone } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import type { ActiveSession } from '@/domain/entities'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/presentation/components/ui/tooltip'
import { cn } from '@/presentation/utils'
import { useSessions } from '../profile/hooks/use-sessions'

interface SecuritySettingsProps {
  onChangePassword: () => void
}

const deviceIcon: Record<string, React.ElementType> = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
}

export const SecuritySettings = memo(({ onChangePassword }: SecuritySettingsProps) => {
  const { sessions, isLoading, revokeSession, revokeAllSessions } = useSessions()
  const [revokeAllOpen, setRevokeAllOpen] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [isRevokingAll, setIsRevokingAll] = useState(false)

  const handleRevoke = useCallback(
    async (id: string) => {
      setRevokingId(id)
      await revokeSession(id)
      setRevokingId(null)
    },
    [revokeSession],
  )

  const handleRevokeAll = useCallback(async () => {
    setIsRevokingAll(true)
    await revokeAllSessions()
    setIsRevokingAll(false)
    setRevokeAllOpen(false)
  }, [revokeAllSessions])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Security</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your password and active sessions.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Key className="size-5 text-amber-600 dark:text-amber-400" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Password</h3>
              <p className="text-xs text-muted-foreground">
                Change your password to keep your account secure
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onChangePassword}>
            Change Password
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Active Sessions</h3>
            <p className="text-xs text-muted-foreground">
              Manage devices where you&apos;re currently logged in
            </p>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setRevokeAllOpen(true)}
            >
              <LogOut className="size-3.5" />
              Logout All
            </Button>
          )}
        </div>

        {isLoading ? (
          <SessionsSkeleton />
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No active sessions found
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <SessionRow
                key={session.id}
                session={session}
                index={index}
                isRevoking={revokingId === session.id}
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Logout All Devices</DialogTitle>
            <DialogDescription>
              This will sign you out of all devices except your current one. You&apos;ll need to
              log in again on those devices.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeAllOpen(false)} disabled={isRevokingAll}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeAll} disabled={isRevokingAll}>
              {isRevokingAll ? 'Logging out...' : 'Logout All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

SecuritySettings.displayName = 'SecuritySettings'

const SessionRow = memo(
  ({
    session,
    index,
    isRevoking,
    onRevoke,
  }: {
    session: ActiveSession
    index: number
    isRevoking: boolean
    onRevoke: (id: string) => void
  }) => {
    const DeviceIcon = deviceIcon[session.device.toLowerCase()] ?? Globe

    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className={cn(
          'flex items-center justify-between rounded-lg border p-4 transition-colors',
          session.isCurrent
            ? 'border-primary/30 bg-primary/4'
            : 'border-border/50 hover:bg-muted/30',
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-lg',
              session.isCurrent ? 'bg-primary/10' : 'bg-muted/60',
            )}
          >
            <DeviceIcon
              className={cn(
                'size-4',
                session.isCurrent ? 'text-primary' : 'text-muted-foreground',
              )}
            />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {session.browser} on {session.os}
              </span>
              {session.isCurrent && (
                <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0">
                  Current
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{session.ipAddress}</span>
              {session.location && (
                <>
                  <span>·</span>
                  <span>{session.location}</span>
                </>
              )}
              <span>·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {format(new Date(session.lastActivity), 'PPpp')}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {!session.isCurrent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-3.5" />
            {isRevoking ? 'Revoking...' : 'Revoke'}
          </Button>
        )}
      </motion.div>
    )
  },
)

SessionRow.displayName = 'SessionRow'

const SessionsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
)
