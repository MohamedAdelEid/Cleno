import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { RoleMember } from '@/domain/entities'
import { rolesApi } from '@/infrastructure/api/roles.api'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Button } from '@/presentation/components/ui/button'
import { SearchInput } from '@/presentation/components/ui/search-input'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { cn } from '@/presentation/utils'

const ROW_EASE = [0.25, 0.1, 0.25, 1] as const
const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

const getInitials = (name: string, fallback?: string) => {
  if (fallback) return fallback
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export interface AssignUsersDialogLabels {
  title: string
  description: string
  searchPlaceholder: string
  assign: string
  cancel: string
  loadMore: string
  empty: string
}

interface AssignUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleSlug: string | null
  roleName: string
  labels: AssignUsersDialogLabels
  onAssign?: (userIds: string[]) => void | Promise<void>
}

export const AssignUsersDialog = ({
  open,
  onOpenChange,
  roleSlug,
  roleName,
  labels,
  onAssign,
}: AssignUsersDialogProps) => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [users, setUsers] = useState<RoleMember[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (open) {
      setPageNumber(1)
      setUsers([])
    }
  }, [open, debouncedQuery, roleSlug])

  const fetchUsers = useCallback(
    async (page: number, append: boolean) => {
      if (!roleSlug) return

      setIsLoading(true)
      const result = await rolesApi.getAvailableUsers(roleSlug, {
        keyword: debouncedQuery || undefined,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      })

      if (result.hasValue && result.data) {
        setUsers((current) => (append ? [...current, ...result.data!] : result.data!))
        const pagination = result.pagination
        setHasMore(
          pagination ? pagination.page < pagination.totalPages : result.data.length >= PAGE_SIZE,
        )
      } else if (!append) {
        setUsers([])
        setHasMore(false)
      }

      setIsLoading(false)
    },
    [debouncedQuery, roleSlug],
  )

  useEffect(() => {
    if (!open || !roleSlug) return
    void fetchUsers(1, false)
  }, [open, roleSlug, debouncedQuery, fetchUsers])

  const toggleUser = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    )
  }

  const handleAssign = async () => {
    if (!selectedIds.length) return
    setIsAssigning(true)
    await onAssign?.(selectedIds)
    setIsAssigning(false)
    setSelectedIds([])
    setQuery('')
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedIds([])
      setQuery('')
      setDebouncedQuery('')
      setUsers([])
      setPageNumber(1)
    }
    onOpenChange(next)
  }

  const handleLoadMore = () => {
    const nextPage = pageNumber + 1
    setPageNumber(nextPage)
    void fetchUsers(nextPage, true)
  }

  const emptyState = useMemo(() => !isLoading && users.length === 0, [isLoading, users.length])

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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isAssigning}>
            {labels.cancel}
          </Button>
          <Button onClick={() => void handleAssign()} disabled={!selectedIds.length || isAssigning}>
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
        {isLoading && users.length === 0 ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))
        ) : emptyState ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <AnimatePresence initial={false}>
            {users.map((user, index) => {
              const isSelected = selectedIds.includes(user.id)

              return (
                <motion.button
                  key={user.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: ROW_EASE, delay: index * 0.02 }}
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
                      {getInitials(user.fullName, user.initials)}
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
        )}

        {hasMore && !isLoading ? (
          <Button variant="ghost" size="sm" className="w-full" onClick={handleLoadMore}>
            {labels.loadMore}
          </Button>
        ) : null}

        {isLoading && users.length > 0 ? <Skeleton className="h-10 w-full rounded-xl" /> : null}
      </div>
    </AppDialog>
  )
}
