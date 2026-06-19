import { motion } from 'framer-motion'
import { Headset, Settings, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'

import type { ManagedRole } from '@/domain/entities'
import { Button } from '@/presentation/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { cn } from '@/presentation/utils'
import { RoleMemberRow } from './role-member-row'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const
const MAX_VISIBLE_USERS = 3

const ROLE_ICONS: Record<string, LucideIcon> = {
  'role-1': ShieldCheck,
  'role-2': Sparkles,
  'role-3': Headset,
}

interface RoleOverviewCardLabels {
  seeAll: string
  seeAllUsers: string
  manage: string
  viewPermissions: string
  statusActive: string
  statusInactive: string
  emptyMembers: string
}

interface RoleOverviewCardProps {
  role: ManagedRole
  index: number
  labels: RoleOverviewCardLabels
  onPermissionsClick: (role: ManagedRole) => void
  onUsersClick: (role: ManagedRole) => void
  onManageClick: (role: ManagedRole) => void
}

export const RoleOverviewCard = ({
  role,
  index,
  labels,
  onPermissionsClick,
  onUsersClick,
  onManageClick,
}: RoleOverviewCardProps) => {
  const RoleIcon = ROLE_ICONS[role.id] ?? ShieldCheck
  const visibleUsers = role.users.slice(0, MAX_VISIBLE_USERS)
  const hiddenUsersCount = Math.max(
    role.remainingUsersCount,
    role.usersCount - visibleUsers.length,
  )

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: CARD_EASE, delay: index * 0.05 }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-[#f6f6f6] dark:bg-[#1a1a1a]"
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background">
            <RoleIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
          </span>

          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{role.name}</h3>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="truncate text-sm text-muted-foreground">{role.description}</p>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-start">
                  {role.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="outline" size="xs" onClick={() => onUsersClick(role)}>
            {labels.seeAll}
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label={labels.viewPermissions}
            onClick={() => onPermissionsClick(role)}
          >
            <ShieldCheck className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div className="mx-2 mb-2 flex flex-1 flex-col gap-2 rounded-lg border border-border/60 bg-background p-2.5">
        {visibleUsers.length > 0 ? (
          visibleUsers.map((member) => (
            <RoleMemberRow
              key={member.id}
              member={member}
              labels={{
                statusActive: labels.statusActive,
                statusInactive: labels.statusInactive,
              }}
            />
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
            {labels.emptyMembers}
          </div>
        )}

        {hiddenUsersCount > 0 ? (
          <Button
            variant="ghost"
            size="xs"
            className="mx-auto h-7 rounded-full px-3 text-xs text-muted-foreground"
            onClick={() => onUsersClick(role)}
          >
            {labels.seeAllUsers.replace('{{count}}', String(role.usersCount))}
          </Button>
        ) : null}
      </div>

      <div className="px-2 pb-2">
        <Button
          variant="secondary"
          className={cn(
            'h-9 w-full rounded-lg bg-background text-foreground shadow-xs hover:bg-muted/80',
          )}
          onClick={() => onManageClick(role)}
        >
          <Settings className="size-4" strokeWidth={1.75} />
          {labels.manage}
        </Button>
      </div>
    </motion.article>
  )
}
