import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { cn } from '@/presentation/utils'

const DIALOG_EASE = [0.25, 0.1, 0.25, 1] as const

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
} as const

export interface AppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: keyof typeof sizeClasses
  className?: string
  bodyClassName?: string
  showCloseButton?: boolean
}

export const AppDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  bodyClassName,
  showCloseButton = true,
}: AppDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      showCloseButton={showCloseButton}
      className={cn('gap-0 overflow-hidden p-0 sm:max-w-lg', sizeClasses[size], className)}
      onOpenAutoFocus={(event) => event.preventDefault()}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: DIALOG_EASE }}
        className="flex max-h-[min(85dvh,720px)] flex-col"
      >
        <DialogHeader className="shrink-0 border-b px-6 py-5 text-start">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && (
          <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-5', bodyClassName)}>
            {children}
          </div>
        )}

        {footer && (
          <DialogFooter className="shrink-0 border-t bg-muted/20 px-6 py-4">{footer}</DialogFooter>
        )}
      </motion.div>
    </DialogContent>
  </Dialog>
)
