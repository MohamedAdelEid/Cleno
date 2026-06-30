import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RotateCcw, Save } from 'lucide-react'

import type { UserProfile } from '@/domain/entities'
import { Button } from '@/presentation/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { Input } from '@/presentation/components/ui/input'
import { Skeleton } from '@/presentation/components/ui/skeleton'

interface GeneralSettingsProps {
  profile: UserProfile | null
  isLoading: boolean
  onSave: (values: GeneralFormValues) => Promise<{ success: boolean }>
  isSaving: boolean
}

const generalSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  phone: z.string().trim().min(1, 'Phone is required').max(30),
})

type GeneralFormValues = z.infer<typeof generalSchema>

export const GeneralSettings = memo(
  ({ profile, isLoading, onSave, isSaving }: GeneralSettingsProps) => {
    const form = useForm<GeneralFormValues>({
      resolver: zodResolver(generalSchema),
      values: {
        fullName: profile?.fullName ?? '',
        email: profile?.email ?? '',
        phone: profile?.phone ?? '',
      },
    })

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
    } = form

    const onSubmit = useCallback(
      async (values: GeneralFormValues) => {
        await onSave(values)
      },
      [onSave],
    )

    if (isLoading) {
      return <GeneralSettingsSkeleton />
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">General Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field invalid={!!errors.fullName}>
                <FieldLabel htmlFor="gen-fullName" required>
                  Full Name
                </FieldLabel>
                <Input id="gen-fullName" placeholder="Your full name" {...register('fullName')} />
                <FieldError message={errors.fullName?.message} />
              </Field>

              <Field invalid={!!errors.email}>
                <FieldLabel htmlFor="gen-email" required>
                  Email
                </FieldLabel>
                <Input
                  id="gen-email"
                  type="email"
                  placeholder="your@email.com"
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </Field>

              <Field invalid={!!errors.phone}>
                <FieldLabel htmlFor="gen-phone" required>
                  Phone
                </FieldLabel>
                <Input id="gen-phone" placeholder="+966 50 000 0000" {...register('phone')} />
                <FieldError message={errors.phone?.message} />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || isSaving}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button type="submit" disabled={!isDirty || isSaving}>
              <Save className="size-3.5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    )
  },
)

GeneralSettings.displayName = 'GeneralSettings'

const GeneralSettingsSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <Skeleton className="mb-4 h-4 w-40" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
)
