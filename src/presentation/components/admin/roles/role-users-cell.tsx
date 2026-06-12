import { motion } from 'framer-motion'

import type { RoleMember } from '@/domain/entities'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { cn } from '@/presentation/utils'

const MAX_VISIBLE = 3

interface RoleUsersCellProps {
  users: RoleMember[]
  moreLabel: (count: number) => string
  onMoreClick?: () => void
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const RoleUsersCell = ({ users, moreLabel, onMoreClick }: RoleUsersCellProps) => {
  if (!users.length) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  const visibleUsers = users.slice(0, MAX_VISIBLE)
  const overflowCount = users.length - MAX_VISIBLE

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center">
        {visibleUsers.map((user, index) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                className={cn('relative', index > 0 && '-ms-2')}
                style={{ zIndex: visibleUsers.length - index }}
              >
                <Avatar
                  size="sm"
                  className="ring-2 ring-background transition-shadow hover:shadow-md"
                >
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-start">
              <p className="font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {overflowCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                type="button"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                onClick={onMoreClick}
                className={cn(
                  'relative -ms-2 flex size-6 items-center justify-center rounded-full',
                  'bg-muted text-[10px] font-semibold text-foreground ring-2 ring-background',
                  'transition-colors hover:bg-primary/10 hover:text-primary',
                )}
                style={{ zIndex: 0 }}
              >
                +{overflowCount}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top">{moreLabel(overflowCount)}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
