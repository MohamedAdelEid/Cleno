import { motion } from 'framer-motion'
import { useState } from 'react'

import type { ManagedRole, RoleMember } from '@/domain/entities'
import { ConfirmDialog } from '@/presentation/components/feedback/confirm-dialog'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'

const ROW_EASE = [0.25, 0.1, 0.25, 1] as const

const getInitials = (name: string, fallback?: string) => {
  if (fallback) return fallback
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export interface RoleUsersDialogLabels {
  title: string
  description: string
  unassign: string
  unassignTitle: string
  unassignDescription: string
  confirm: string
  cancel: string
}

interface RoleUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: ManagedRole | null
  isLoading?: boolean
  labels: RoleUsersDialogLabels
  onUnassign?: (roleId: string, userId: string) => void
}

export const RoleUsersDialog = ({
  open,
  onOpenChange,
  role,
  isLoading = false,
  labels,
  onUnassign,
}: RoleUsersDialogProps) => {
  const [pendingUser, setPendingUser] = useState<RoleMember | null>(null)

  const handleConfirmUnassign = () => {
    if (role && pendingUser) {
      onUnassign?.(role.id, pendingUser.id)
    }
    setPendingUser(null)
  }

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={onOpenChange}
        title={labels.title}
        description={role ? labels.description.replace('{{role}}', role.name) : labels.description}
        size="md"
        bodyClassName="space-y-2"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))
        ) : (
          role?.users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: ROW_EASE, delay: index * 0.04 }}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5"
          >
            <Avatar size="sm">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
              <AvatarFallback className="text-[10px]">
                {getInitials(user.fullName, user.initials)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPendingUser(user)}>
              {labels.unassign}
            </Button>
          </motion.div>
          ))
        )}
      </AppDialog>

      <ConfirmDialog
        open={!!pendingUser}
        onOpenChange={(next) => !next && setPendingUser(null)}
        title={labels.unassignTitle}
        description={labels.unassignDescription.replace(
          '{{name}}',
          pendingUser?.fullName ?? '',
        )}
        confirmLabel={labels.confirm}
        cancelLabel={labels.cancel}
        destructive
        onConfirm={handleConfirmUnassign}
      />
    </>
  )
}
