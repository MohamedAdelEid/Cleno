import { motion } from 'framer-motion'
import { Check, Download, FileText, X } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/presentation/utils'
import type { FilePreviewItem } from './types'

interface FileUploadPreviewItemProps {
  item: FilePreviewItem
  removeLabel: string
  downloadLabel?: string
  onRemove: () => void
  onDownload?: () => void
  disabled?: boolean
  progress?: number
  isUploading?: boolean
  uploadProgressLabel?: string
  uploadCompleteLabel?: string
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
  downloadLabel = 'Download file',
  onRemove,
  onDownload,
  disabled,
  progress = 0,
  isUploading = false,
  uploadProgressLabel = 'Uploading...',
  uploadCompleteLabel = 'Upload complete',
}: FileUploadPreviewItemProps) => {
  const isComplete = !isUploading && progress >= 100

  return (
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
          'flex w-full flex-col gap-3 rounded-[10px] border border-border bg-background p-3',
        )}
      >
        <div className="flex w-full items-center gap-3">
          {item.isImage ? (
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
              <img src={item.previewUrl} alt={item.name} className="size-full object-cover" />
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                  <span className="text-xs font-semibold tabular-nums text-primary">
                    {progress}%
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative flex size-14 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
              <FileText className="size-5 text-muted-foreground" />
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                  <span className="text-xs font-semibold tabular-nums text-primary">
                    {progress}%
                  </span>
                </div>
              ) : null}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
            {item.size > 0 ? (
              <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
            ) : null}
            {isUploading ? (
              <p className="text-xs font-medium text-primary">{uploadProgressLabel}</p>
            ) : isComplete ? (
              <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="size-3.5" />
                {uploadCompleteLabel}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onDownload ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={onDownload}
                disabled={disabled || isUploading}
                aria-label={downloadLabel}
              >
                <Download className="size-4" />
              </Button>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={onRemove}
              disabled={disabled || isUploading}
              aria-label={removeLabel}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {isUploading || isComplete ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
            <motion.div
              className={cn('h-full rounded-full', isComplete ? 'bg-emerald-500' : 'bg-primary')}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress, isComplete ? 100 : 0)}%` }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        ) : null}
      </div>
    </motion.li>
  )
}
