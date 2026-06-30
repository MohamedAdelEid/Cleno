import { z } from 'zod'

import { ManagedUserStatus } from '@/domain/enums'

const FILE_MAX_SIZE = 5 * 1024 * 1024

const userStatusValues = [
  ManagedUserStatus.Active,
  ManagedUserStatus.Inactive,
  ManagedUserStatus.Suspended,
] as [ManagedUserStatus, ManagedUserStatus, ManagedUserStatus]

const validateImageFiles = (
  files: File[],
  ctx: z.RefinementCtx,
  messages: { invalid: string; maxSize: string },
) => {
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      ctx.addIssue({ code: 'custom', message: messages.invalid })
      return
    }

    if (file.size > FILE_MAX_SIZE) {
      ctx.addIssue({ code: 'custom', message: messages.maxSize })
    }
  }
}

export const createUserFormSchema = (
  messages: {
    fullNameRequired: string
    fullNameMin: string
    fullNameMax: string
    emailRequired: string
    emailInvalid: string
    phoneRequired: string
    phoneMax: string
    roleRequired: string
    passwordRequired: string
    passwordMin: string
    photoInvalid: string
    photoMaxSize: string
  },
  options?: { mode?: 'create' | 'edit' },
) => {
  const mode = options?.mode ?? 'create'

  const passwordSchema =
    mode === 'create'
      ? z.string().trim().min(1, messages.passwordRequired).min(8, messages.passwordMin)
      : z
          .string()
          .trim()
          .refine((value) => !value || value.length >= 8, messages.passwordMin)

  return z.object({
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
    roleId: z.string().trim().min(1, messages.roleRequired),
    status: z.enum(userStatusValues),
    password: passwordSchema,
    photo: z
      .array(z.instanceof(File))
      .max(1)
      .superRefine((files, ctx) =>
        validateImageFiles(files, ctx, {
          invalid: messages.photoInvalid,
          maxSize: messages.photoMaxSize,
        }),
      ),
    photoPath: z.string().optional(),
    photoUrl: z.string().optional(),
    removePhoto: z.boolean().optional(),
  })
}

export type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>

export const emptyUserFormValues: UserFormValues = {
  fullName: '',
  email: '',
  phone: '',
  roleId: '',
  status: ManagedUserStatus.Active,
  password: '',
  photo: [],
  photoPath: undefined,
  photoUrl: undefined,
  removePhoto: false,
}
