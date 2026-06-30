import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { getManagedUserInitials } from './users.data'

interface UserPhotoPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName: string
  email?: string
  photoUrl?: string | null
}

export const UserPhotoPreviewDialog = ({
  open,
  onOpenChange,
  fullName,
  email,
  photoUrl,
}: UserPhotoPreviewDialogProps) => (
  <AppDialog
    open={open}
    onOpenChange={onOpenChange}
    title={fullName}
    description={email}
    size="md"
    bodyClassName="flex items-center justify-center bg-muted/20 py-6"
  >
    {photoUrl ? (
      <div className="mx-auto flex w-full max-w-sm items-center justify-center">
        <img
          src={photoUrl}
          alt={fullName}
          className="max-h-[min(60dvh,420px)] w-full rounded-xl border border-border/70 object-contain shadow-sm"
        />
      </div>
    ) : (
      <Avatar className="size-32 border border-border/70">
        <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
          {getManagedUserInitials(fullName)}
        </AvatarFallback>
      </Avatar>
    )}
  </AppDialog>
)
