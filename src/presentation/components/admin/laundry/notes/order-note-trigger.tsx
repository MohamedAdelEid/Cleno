import { MessageSquarePlus } from 'lucide-react'
import { useState } from 'react'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
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
import { cn } from '@/presentation/utils'

interface OrderNoteTriggerProps {
  order: LaundryOrder
  onAddNote: (orderId: string, content: string) => void
  labels: {
    title: string
    placeholder: string
    submit: string
    cancel: string
  }
  className?: string
}

export const OrderNoteTrigger = ({ order, onAddNote, labels, className }: OrderNoteTriggerProps) => {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')

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
          'flex size-7 shrink-0 items-center justify-center rounded-lg',
          'border border-border/70 bg-muted/30 text-muted-foreground transition-colors',
          'hover:bg-muted/60 hover:text-foreground',
          className,
        )}
        aria-label={labels.title}
      >
        <MessageSquarePlus className="size-3.5" strokeWidth={2} />
        {order.notes.length > 0 && (
          <span className="sr-only">{order.notes.length} notes</span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>{order.orderNumber}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={labels.placeholder}
            rows={3}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {labels.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              {labels.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
