import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

import type { ChangePasswordFormValues } from '@/domain/schemas'
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
import { cn } from '@/presentation/utils'
import { useChangePassword } from './hooks/use-change-password'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
  if (!password) return { level: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-destructive' }
  if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' }
  if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-500' }
  if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-emerald-500' }
  return { level: 5, label: 'Very Strong', color: 'bg-emerald-600' }
}

export const ChangePasswordDialog = memo(({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const { form, isSubmitting, submitError, isSuccess, submit, resetForm } = useChangePassword()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  const newPassword = watch('newPassword')
  const strength = useMemo(() => getPasswordStrength(newPassword ?? ''), [newPassword])

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const onSubmit = async (values: ChangePasswordFormValues) => {
    await submit(values)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-8"
          >
            <CheckCircle2 className="size-12 text-emerald-500" />
            <p className="text-center text-sm font-medium">Password changed successfully!</p>
            <Button variant="outline" onClick={() => handleClose(false)} className="mt-2">
              Close
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword" required>
                Current Password
              </FieldLabel>
              <Input
                id="currentPassword"
                isPasswordField
                placeholder="Enter current password"
                {...register('currentPassword')}
              />
              <FieldError message={errors.currentPassword?.message} />
            </Field>

            <Field invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword" required>
                New Password
              </FieldLabel>
              <Input
                id="newPassword"
                isPasswordField
                placeholder="Enter new password"
                {...register('newPassword')}
              />
              {newPassword && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-colors duration-300',
                          i < strength.level ? strength.color : 'bg-muted',
                        )}
                      />
                    ))}
                  </div>
                  <p
                    className={cn(
                      'text-xs',
                      strength.level <= 1
                        ? 'text-destructive'
                        : strength.level <= 2
                          ? 'text-amber-600'
                          : 'text-emerald-600',
                    )}
                  >
                    {strength.label}
                  </p>
                </div>
              )}
              <FieldError message={errors.newPassword?.message} />
            </Field>

            <Field invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword" required>
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                isPasswordField
                placeholder="Confirm new password"
                {...register('confirmPassword')}
              />
              <FieldError message={errors.confirmPassword?.message} />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
})

ChangePasswordDialog.displayName = 'ChangePasswordDialog'
