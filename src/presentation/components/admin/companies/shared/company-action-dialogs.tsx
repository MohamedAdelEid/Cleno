import { useEffect, useState } from 'react'

import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Textarea } from '@/presentation/components/ui/input'

interface CompanyApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  loading?: boolean
  onConfirm: () => void
}

export const CompanyApproveDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  onConfirm,
}: CompanyApproveDialogProps) => (
  <AppDialog
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  />
)

interface CompanyRejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  reasonLabel: string
  reasonPlaceholder: string
  reasonRequired: string
  confirmLabel: string
  cancelLabel: string
  loading?: boolean
  onConfirm: (reason: string) => void
}

export const CompanyRejectDialog = ({
  open,
  onOpenChange,
  title,
  description,
  reasonLabel,
  reasonPlaceholder,
  reasonRequired,
  confirmLabel,
  cancelLabel,
  loading = false,
  onConfirm,
}: CompanyRejectDialogProps) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setReason('')
      setError(null)
    }
  }, [open])

  const handleConfirm = () => {
    const trimmed = reason.trim()
    if (!trimmed) {
      setError(reasonRequired)
      return
    }

    onConfirm(trimmed)
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label htmlFor="reject-reason" className="text-sm font-medium text-foreground">
          {reasonLabel}
        </label>
        <Textarea
          id="reject-reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value)
            if (error) setError(null)
          }}
          placeholder={reasonPlaceholder}
          rows={4}
          autoResize
          invalid={!!error}
          className="min-h-28 resize-none rounded-xl"
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </AppDialog>
  )
}

interface CompanyActiveStateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  mode: 'activate' | 'deactivate'
  loading?: boolean
  onConfirm: () => void
}

export const CompanyActiveStateDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  mode,
  loading = false,
  onConfirm,
}: CompanyActiveStateDialogProps) => (
  <AppDialog
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={mode === 'deactivate' ? 'destructive' : 'default'}
          onClick={onConfirm}
          disabled={loading}
        >
          {confirmLabel}
        </Button>
      </>
    }
  />
)
