import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Copy, Hash, Shield, Clock, Calendar, Key } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import type { UserProfile } from '@/domain/entities'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/presentation/components/ui/tooltip'

interface AccountInfoCardProps {
  profile: UserProfile | null
  isLoading: boolean
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  copyable,
}: {
  icon: React.ElementType
  label: string
  value: string
  copyable?: boolean
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [value])

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted/60">
          <Icon className="size-4 text-muted-foreground" />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        {copyable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleCopy}
                aria-label={`Copy ${label}`}
              >
                <Copy className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export const AccountInfoCard = memo(({ profile, isLoading }: AccountInfoCardProps) => {
  if (isLoading) {
    return <AccountInfoSkeleton />
  }

  if (!profile) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      className="rounded-2xl border border-border/60 bg-card p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Account Information</h2>
        <Badge variant="outline" className="text-xs">
          {profile.role}
        </Badge>
      </div>

      <div className="divide-y divide-border/50">
        <InfoRow icon={Hash} label="User ID" value={profile.id} copyable />
        <InfoRow icon={Shield} label="Role" value={profile.role} />
        <InfoRow
          icon={Key}
          label="Permissions"
          value={`${profile.permissions.length} assigned`}
        />
        <InfoRow
          icon={Calendar}
          label="Created"
          value={format(new Date(profile.createdAt), 'MMM d, yyyy')}
        />
        <InfoRow
          icon={Calendar}
          label="Updated"
          value={format(new Date(profile.updatedAt), 'MMM d, yyyy')}
        />
        <InfoRow
          icon={Clock}
          label="Last Login"
          value={
            profile.lastLoginAt
              ? format(new Date(profile.lastLoginAt), 'MMM d, yyyy h:mm a')
              : 'Never'
          }
        />
      </div>
    </motion.div>
  )
})

AccountInfoCard.displayName = 'AccountInfoCard'

const AccountInfoSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card p-6">
    <Skeleton className="mb-4 h-6 w-44" />
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  </div>
)
