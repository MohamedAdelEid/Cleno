import { z } from 'zod'

export const createProfileFormSchema = (messages: {
  fullNameRequired: string
  fullNameMin: string
  fullNameMax: string
  emailRequired: string
  emailInvalid: string
  phoneRequired: string
  phoneMax: string
}) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(1, messages.fullNameRequired)
      .min(2, messages.fullNameMin)
      .max(120, messages.fullNameMax),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .refine((value) => z.email().safeParse(value).success, messages.emailInvalid),
    phone: z.string().trim().min(1, messages.phoneRequired).max(30, messages.phoneMax),
  })

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileFormSchema>>

export const createChangePasswordSchema = (messages: {
  currentRequired: string
  newRequired: string
  newMin: string
  confirmRequired: string
  confirmMatch: string
}) =>
  z
    .object({
      currentPassword: z.string().trim().min(1, messages.currentRequired),
      newPassword: z.string().trim().min(1, messages.newRequired).min(8, messages.newMin),
      confirmPassword: z.string().trim().min(1, messages.confirmRequired),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: messages.confirmMatch,
      path: ['confirmPassword'],
    })

export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>
