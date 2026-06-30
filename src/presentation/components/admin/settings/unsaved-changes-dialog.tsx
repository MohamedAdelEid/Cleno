import { memo } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'

interface UnsavedChangesDialogProps {
  open: boolean
  onDiscard: () => void
  onCancel: () => void
}

export const UnsavedChangesDialog = memo(
  ({ open, onDiscard, onCancel }: UnsavedChangesDialogProps) => (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-500/10">
            <AlertTriangle className="size-6 text-amber-500" />
          </div>
          <DialogTitle className="text-center">Unsaved Changes</DialogTitle>
          <DialogDescription className="text-center">
            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onCancel}>
            Stay
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            Discard Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
)

UnsavedChangesDialog.displayName = 'UnsavedChangesDialog'
