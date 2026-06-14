import { motion } from 'framer-motion'
import { FileText, X } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/presentation/utils'
import type { FilePreviewItem } from './types'

interface FileUploadPreviewItemProps {
  item: FilePreviewItem
  removeLabel: string
  onRemove: () => void
  disabled?: boolean
}

const formatFileSize = (bytes: number) => {
  if (bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const FileUploadPreviewItem = ({
  item,
  removeLabel,
  onRemove,
  disabled,
}: FileUploadPreviewItemProps) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{
      opacity: 0,
      y: -6,
      scale: 0.97,
      height: 0,
      marginTop: 0,
      transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
    }}
    transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
    className="w-full overflow-hidden"
  >
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-[10px] border border-border bg-background p-3',
      )}
    >
      {item.isImage ? (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
          <img src={item.previewUrl} alt={item.name} className="size-full object-cover" />
        </div>
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
          <FileText className="size-5 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
        {item.size > 0 ? (
          <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        disabled={disabled}
        aria-label={removeLabel}
      >
        <X className="size-4" />
      </Button>
    </div>
  </motion.li>
)
