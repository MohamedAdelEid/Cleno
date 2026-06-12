import { ChevronsUpDown, LogOut, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { useAuthStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'

interface SidebarUserMenuProps {
  isCollapsed: boolean
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const SidebarUserMenu = ({ isCollapsed }: SidebarUserMenuProps) => {
  const { t } = useTranslation('navigation')
  const { isRtl } = useDirection()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)

  const displayName = user?.fullName ?? t('guestUser')
  const displayEmail = user?.email ?? t('guestEmail')

  const handleLogout = () => {
    clearSession()
    navigate(ROUTES.AUTH.LOGIN)
  }

  const handleAccount = () => {
    navigate(ROUTES.SETTINGS.INDEX)
  }

  const triggerButton = (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-primary/40 dark:bg-sidebar-primary/0 p-2',
        'transition-colors duration-200 hover:bg-sidebar-accent',
        'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
        isCollapsed && 'justify-center border-transparent bg-transparent px-2',
      )}
    >
      <div className="relative shrink-0">
        <Avatar size="sm">
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-sidebar-accent text-[10px] text-sidebar-foreground">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <span
          aria-hidden
          className="absolute end-0 bottom-0 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar"
        />
      </div>

      {!isCollapsed && (
        <>
          <div className="min-w-0 flex-1 text-start">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{displayEmail}</p>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/50" />
        </>
      )}
    </button>
  )

  const menuTrigger = (
    <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
  )

  return (
    <DropdownMenu>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{menuTrigger}</TooltipTrigger>
          <TooltipContent side={isRtl ? 'left' : 'right'} sideOffset={8}>
            {displayName}
          </TooltipContent>
        </Tooltip>
      ) : (
        menuTrigger
      )}

      <DropdownMenuContent
        side={isCollapsed ? (isRtl ? 'left' : 'right') : 'top'}
        align={isCollapsed ? 'end' : 'start'}
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="text-[10px]">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleAccount}>
          <UserRound />
          {t('account')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut />
          {t('logOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
