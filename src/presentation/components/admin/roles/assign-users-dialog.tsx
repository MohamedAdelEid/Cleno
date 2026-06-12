import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { RoleMember } from '@/domain/entities'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Button } from '@/presentation/components/ui/button'
import { SearchInput } from '@/presentation/components/ui/search-input'
import { cn } from '@/presentation/utils'

const ROW_EASE = [0.25, 0.1, 0.25, 1] as const

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export interface AssignUsersDialogLabels {
  title: string
  description: string
  searchPlaceholder: string
  assign: string
  cancel: string
}

interface AssignUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleName: string
  users: RoleMember[]
  assignedUserIds: string[]
  labels: AssignUsersDialogLabels
  onAssign?: (userIds: string[]) => void
}

export const AssignUsersDialog = ({
  open,
  onOpenChange,
  roleName,
  users,
  assignedUserIds,
  labels,
  onAssign,
}: AssignUsersDialogProps) => {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const availableUsers = useMemo(
    () => users.filter((user) => !assignedUserIds.includes(user.id)),
    [assignedUserIds, users],
  )

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return availableUsers

    return availableUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized),
    )
  }, [availableUsers, query])

  const toggleUser = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    )
  }

  const handleAssign = () => {
    if (!selectedIds.length) return
    onAssign?.(selectedIds)
    setSelectedIds([])
    setQuery('')
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedIds([])
      setQuery('')
    }
    onOpenChange(next)
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={labels.title}
      description={labels.description.replace('{{role}}', roleName)}
      size="md"
      bodyClassName="space-y-4"
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {labels.cancel}
          </Button>
          <Button onClick={handleAssign} disabled={!selectedIds.length}>
            {labels.assign}
            {selectedIds.length > 0 && ` (${selectedIds.length})`}
          </Button>
        </>
      }
    >
      <SearchInput
        value={query}
        onValueChange={setQuery}
        placeholder={labels.searchPlaceholder}
        containerClassName="w-full"
      />

      <div className="max-h-72 space-y-2 overflow-y-auto pe-1">
        <AnimatePresence initial={false}>
          {filteredUsers.map((user, index) => {
            const isSelected = selectedIds.includes(user.id)

            return (
              <motion.button
                key={user.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: ROW_EASE, delay: index * 0.03 }}
                onClick={() => toggleUser(user.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors',
                  isSelected
                    ? 'border-primary/40 bg-primary/8 shadow-sm'
                    : 'border-border/70 bg-background hover:bg-muted/30',
                )}
              >
                <Avatar size="sm">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border transition-all',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/80 bg-background',
                  )}
                >
                  {isSelected && <Check className="size-3" strokeWidth={2.5} />}
                </span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </AppDialog>
  )
}
