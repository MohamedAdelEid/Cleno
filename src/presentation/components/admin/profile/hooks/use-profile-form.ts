import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { UserProfile } from '@/domain/entities'
import { createProfileFormSchema, type ProfileFormValues } from '@/domain/schemas'

interface UseProfileFormOptions {
  profile: UserProfile | null
  onUpdate: (values: ProfileFormValues) => Promise<{ success: boolean }>
}

export const useProfileForm = ({ profile, onUpdate }: UseProfileFormOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schema = createProfileFormSchema({
    fullNameRequired: 'Full name is required',
    fullNameMin: 'Name must be at least 2 characters',
    fullNameMax: 'Name must be at most 120 characters',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email address',
    phoneRequired: 'Phone number is required',
    phoneMax: 'Phone must be at most 30 characters',
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone ?? '',
      })
    }
  }, [profile, form])

  const submit = useCallback(
    async (values: ProfileFormValues): Promise<{ success: boolean }> => {
      setIsSubmitting(true)
      setSubmitError(null)

      const result = await onUpdate(values)

      setIsSubmitting(false)

      if (!result.success) {
        setSubmitError('Failed to update profile')
        return { success: false }
      }

      return { success: true }
    },
    [onUpdate],
  )

  const resetForm = useCallback(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone ?? '',
      })
    }
    setSubmitError(null)
  }, [profile, form])

  return {
    form,
    isSubmitting,
    submitError,
    submit,
    resetForm,
    isDirty: form.formState.isDirty,
  }
}
