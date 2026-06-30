import { memo } from 'react'

import type { UserProfile } from '@/domain/entities'
import type { ProfileFormValues } from '@/domain/schemas'
import { Button } from '@/presentation/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { Input } from '@/presentation/components/ui/input'
import { useProfileForm } from './hooks/use-profile-form'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: UserProfile | null
  onUpdate: (values: ProfileFormValues) => Promise<{ success: boolean }>
  onSuccess: () => void
}

export const EditProfileDialog = memo(
  ({ open, onOpenChange, profile, onUpdate, onSuccess }: EditProfileDialogProps) => {
    const { form, isSubmitting, submitError, submit, resetForm, isDirty } = useProfileForm({
      profile,
      onUpdate,
    })

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = form

    const handleClose = (isOpen: boolean) => {
      if (!isOpen) {
        resetForm()
      }
      onOpenChange(isOpen)
    }

    const onSubmit = async (values: ProfileFormValues) => {
      const result = await submit(values)
      if (result.success) {
        onSuccess()
        onOpenChange(false)
      }
    }

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName" required>
                Full Name
              </FieldLabel>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                {...register('fullName')}
              />
              <FieldError message={errors.fullName?.message} />
            </Field>

            <Field invalid={!!errors.email}>
              <FieldLabel htmlFor="email" required>
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </Field>

            <Field invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone" required>
                Phone Number
              </FieldLabel>
              <Input
                id="phone"
                placeholder="Enter your phone number"
                {...register('phone')}
              />
              <FieldError message={errors.phone?.message} />
            </Field>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  },
)

EditProfileDialog.displayName = 'EditProfileDialog'
