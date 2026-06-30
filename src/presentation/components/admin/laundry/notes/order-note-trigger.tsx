import { format, parseISO } from 'date-fns'
import { MessageSquare, MessageSquarePlus } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { LaundryOrder, LaundryOrderNote } from '@/domain/entities/laundry-order.entity'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Button } from '@/presentation/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { Textarea } from '@/presentation/components/ui/input'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

interface OrderNoteTriggerProps {
  order: LaundryOrder
  onAddNote: (orderId: string, content: string) => void
  className?: string
}

const formatNoteDate = (value: string): string => {
  try {
    return format(parseISO(value), 'MMM d, yyyy · h:mm a')
  } catch {
    return value
  }
}

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

const resolveNoteAuthor = (note: LaundryOrderNote): string | null => {
  const name = note.lastModifiedBy?.fullName?.trim() || note.author?.trim()
  return name || null
}

const wasNoteEdited = (note: LaundryOrderNote): boolean =>
  Boolean(note.updatedAt && note.updatedAt !== note.createdAt)

export const OrderNoteTrigger = ({ order, onAddNote, className }: OrderNoteTriggerProps) => {
  const { t } = useTranslation('laundry')
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')

  const existingNote = order.note
  const isEditing = Boolean(existingNote)
  const author = existingNote ? resolveNoteAuthor(existingNote) : null

  useEffect(() => {
    if (open) {
      setContent(existingNote?.content ?? '')
    }
  }, [open, existingNote?.content])

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    onAddNote(order.id, trimmed)
    setContent('')
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'relative flex size-7 shrink-0 items-center justify-center rounded-lg',
          'border transition-colors',
          existingNote
            ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
            : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          className,
        )}
        aria-label={isEditing ? t('noteEditTitle') : t('addNote')}
      >
        {existingNote ? (
          <MessageSquare className="size-3.5" strokeWidth={2} />
        ) : (
          <MessageSquarePlus className="size-3.5" strokeWidth={2} />
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('noteEditTitle') : t('addNote')}</DialogTitle>
            <DialogDescription>{order.orderNumber}</DialogDescription>
          </DialogHeader>

          {existingNote && author && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
              <div className="flex items-start gap-2.5">
                <Avatar size="sm">
                  <AvatarImage
                    src={existingNote.lastModifiedBy?.avatarUrl ?? undefined}
                    alt={author}
                  />
                  <AvatarFallback className="text-[10px]">{getInitials(author)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-medium text-foreground">
                    {wasNoteEdited(existingNote) ? t('noteLastEditedBy') : t('noteWrittenBy')}{' '}
                    <span className="text-foreground/80">{author}</span>
                  </p>
                  {existingNote.lastModifiedBy?.email && (
                    <p className="truncate text-[10px] text-muted-foreground">
                      {existingNote.lastModifiedBy.email}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {wasNoteEdited(existingNote) && existingNote.updatedAt
                      ? `${t('noteUpdatedAt')} ${formatNoteDate(existingNote.updatedAt)}`
                      : `${t('noteCreatedAt')} ${formatNoteDate(existingNote.createdAt)}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('notePlaceholder')}
            rows={4}
            autoFocus
          />

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('noteCancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              {isEditing ? t('noteSave') : t('noteSubmit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
