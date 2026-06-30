import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createChangePasswordSchema, type ChangePasswordFormValues } from '@/domain/schemas'
import { mockDelay } from '../profile.data'

export const useChangePassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const schema = createChangePasswordSchema({
    currentRequired: 'Current password is required',
    newRequired: 'New password is required',
    newMin: 'Password must be at least 8 characters',
    confirmRequired: 'Please confirm your password',
    confirmMatch: 'Passwords do not match',
  })

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const submit = useCallback(
    async (_values: ChangePasswordFormValues): Promise<{ success: boolean }> => {
      setIsSubmitting(true)
      setSubmitError(null)
      setIsSuccess(false)

      await mockDelay(600)

      setIsSubmitting(false)
      setIsSuccess(true)
      form.reset()
      return { success: true }
    },
    [form],
  )

  const resetForm = useCallback(() => {
    form.reset()
    setSubmitError(null)
    setIsSuccess(false)
  }, [form])

  return {
    form,
    isSubmitting,
    submitError,
    isSuccess,
    submit,
    resetForm,
  }
}
