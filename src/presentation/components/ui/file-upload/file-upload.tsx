import { AnimatePresence, motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/presentation/utils'
import { FileUploadPreviewItem } from './file-upload-preview-item'
import type { FilePreviewItem, FileUploadProps } from './types'

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024
const PREVIEW_EASE = [0.25, 0.1, 0.25, 1] as const

const createPreviewItem = (file: File): FilePreviewItem => ({
  id: `${file.name}-${file.size}-${file.lastModified}`,
  file,
  previewUrl: URL.createObjectURL(file),
  name: file.name,
  size: file.size,
  isImage: file.type.startsWith('image/'),
})

export const FileUpload = ({
  value,
  onChange,
  multiple = false,
  accept,
  maxFiles = multiple ? 5 : 1,
  maxSize = DEFAULT_MAX_SIZE,
  disabled,
  labels,
  existingPreviewUrl,
  onExistingPreviewRemove,
  className,
  dropzoneClassName,
}: FileUploadProps) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showExistingPreview, setShowExistingPreview] = useState(!!existingPreviewUrl)

  useEffect(() => {
    setShowExistingPreview(!!existingPreviewUrl && value.length === 0)
  }, [existingPreviewUrl, value.length])

  const previewItems = useMemo(() => value.map(createPreviewItem), [value])

  useEffect(
    () => () => {
      previewItems.forEach((item) => {
        if (!item.isRemote) URL.revokeObjectURL(item.previewUrl)
      })
    },
    [previewItems],
  )

  const validateFiles = useCallback(
    (files: File[]) => {
      const isAccepted = (file: File) => {
        if (!accept) return true

        return accept.split(',').some((part) => {
          const trimmed = part.trim()
          if (trimmed === 'image/*') return file.type.startsWith('image/')
          if (trimmed === 'application/pdf') return file.type === 'application/pdf'
          if (trimmed.endsWith('/*')) return file.type.startsWith(trimmed.replace('/*', '/'))
          return file.type === trimmed || file.name.toLowerCase().endsWith(trimmed.replace('.', ''))
        })
      }

      const valid: File[] = []

      for (const file of files) {
        if (!isAccepted(file)) continue
        if (file.size > maxSize) continue
        valid.push(file)
      }

      if (!multiple) return valid.slice(0, 1)
      return valid.slice(0, maxFiles)
    },
    [accept, maxFiles, maxSize, multiple],
  )

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length || disabled) return

      const incoming = validateFiles(Array.from(fileList))
      if (!incoming.length) return

      if (multiple) {
        onChange([...value, ...incoming].slice(0, maxFiles))
        return
      }

      onChange(incoming)
      setShowExistingPreview(false)
    },
    [disabled, maxFiles, multiple, onChange, validateFiles, value],
  )

  const handleRemove = (index: number) => {
    const next = value.filter((_, itemIndex) => itemIndex !== index)
    onChange(next)
    if (!next.length && existingPreviewUrl) {
      setShowExistingPreview(true)
    }
  }

  const handleRemoveExisting = () => {
    setShowExistingPreview(false)
    onExistingPreviewRemove?.()
  }

  const hasPreview = previewItems.length > 0 || (showExistingPreview && !!existingPreviewUrl)
  const hint = labels.dragHint
    .replace('{{maxFiles}}', String(multiple ? maxFiles : 1))
    .replace('{{maxSize}}', '5MB')

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        layout
        onDragEnter={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (!disabled) setIsDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (event.currentTarget.contains(event.relatedTarget as Node)) return
          setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        animate={{
          scale: isDragging ? 1.005 : 1,
          borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-border)',
          backgroundColor: isDragging
            ? 'color-mix(in oklab, var(--color-primary) 6%, transparent)'
            : 'color-mix(in oklab, var(--color-muted) 15%, transparent)',
        }}
        transition={{ duration: 0.2, ease: PREVIEW_EASE }}
        className={cn(
          'relative flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-border px-4 py-5 text-center',
          'min-h-[7.75rem]',
          disabled && 'pointer-events-none opacity-60',
          dropzoneClassName,
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background/90">
            <Upload className="size-4 text-foreground" strokeWidth={1.75} />
          </span>

          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">{labels.dragTitle}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full px-4 text-xs"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {hasPreview ? labels.replace : labels.browse}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence initial={false} mode="popLayout">
        {hasPreview ? (
          <motion.div
            key="preview-list"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.28, ease: PREVIEW_EASE }}
            className="overflow-hidden"
          >
            <ul className="flex w-full flex-col gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {showExistingPreview && existingPreviewUrl ? (
                  <FileUploadPreviewItem
                    key="existing-preview"
                    item={{
                      id: 'existing-preview',
                      previewUrl: existingPreviewUrl,
                      name: labels.existingFile,
                      size: 0,
                      isImage: true,
                      isRemote: true,
                    }}
                    removeLabel={labels.remove}
                    onRemove={handleRemoveExisting}
                    disabled={disabled}
                  />
                ) : null}

                {previewItems.map((item, index) => (
                  <FileUploadPreviewItem
                    key={item.id}
                    item={item}
                    removeLabel={labels.remove}
                    onRemove={() => handleRemove(index)}
                    disabled={disabled}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
