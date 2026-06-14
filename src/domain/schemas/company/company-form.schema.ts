import { z } from 'zod'

const FILE_MAX_SIZE = 5 * 1024 * 1024

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

const validateDocumentFiles = (
  files: File[],
  ctx: z.RefinementCtx,
  messages: { invalid: string; maxSize: string },
) => {
  for (const file of files) {
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (!isImage && !isPdf) {
      ctx.addIssue({ code: 'custom', message: messages.invalid })
      return
    }
    if (file.size > FILE_MAX_SIZE) {
      ctx.addIssue({ code: 'custom', message: messages.maxSize })
    }
  }
}

export const createCompanyFormSchema = (
  messages: {
    businessNameRequired: string
    businessNameMin: string
    businessNameMax: string
    businessTypeRequired: string
    businessTypeMin: string
    mainContactRequired: string
    phoneRequired: string
    emailRequired: string
    emailInvalid: string
    googleMapLinkRequired: string
    urlInvalid: string
    passwordRequired: string
    passwordMin: string
    logoInvalid: string
    logoMaxSize: string
    commercialRegistrationInvalid: string
    commercialRegistrationMaxSize: string
  },
  options?: { mode?: 'create' | 'edit' },
) => {
  const mode = options?.mode ?? 'create'

  const passwordSchema =
    mode === 'create'
      ? z
          .string()
          .trim()
          .min(1, messages.passwordRequired)
          .min(8, messages.passwordMin)
      : z.string().trim().refine((value) => !value || value.length >= 8, messages.passwordMin)

  return z.object({
    businessName: z
      .string()
      .trim()
      .min(1, messages.businessNameRequired)
      .min(2, messages.businessNameMin)
      .max(120, messages.businessNameMax),
    businessType: z
      .string()
      .trim()
      .min(1, messages.businessTypeRequired)
      .min(2, messages.businessTypeMin),
    mainContactPerson: z
      .string()
      .trim()
      .min(1, messages.mainContactRequired)
      .max(120),
    phone: z.string().trim().min(1, messages.phoneRequired).max(30),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .refine((value) => z.email().safeParse(value).success, messages.emailInvalid),
    password: passwordSchema,
    address: z.string().trim().max(250),
    googleMapLink: z
      .string()
      .trim()
      .min(1, messages.googleMapLinkRequired)
      .refine((value) => z.url().safeParse(value).success, messages.urlInvalid),
    logo: z
      .array(z.instanceof(File))
      .max(1)
      .superRefine((files, ctx) =>
        validateImageFiles(files, ctx, {
          invalid: messages.logoInvalid,
          maxSize: messages.logoMaxSize,
        }),
      ),
    commercialRegistration: z
      .array(z.instanceof(File))
      .max(1)
      .superRefine((files, ctx) =>
        validateDocumentFiles(files, ctx, {
          invalid: messages.commercialRegistrationInvalid,
          maxSize: messages.commercialRegistrationMaxSize,
        }),
      ),
    isActive: z.boolean(),
  })
}

export type CompanyFormValues = z.infer<ReturnType<typeof createCompanyFormSchema>>

export const emptyCompanyFormValues: CompanyFormValues = {
  businessName: '',
  businessType: '',
  mainContactPerson: '',
  phone: '',
  email: '',
  password: '',
  address: '',
  googleMapLink: '',
  logo: [],
  commercialRegistration: [],
  isActive: true,
}

export const FILE_MAX_SIZE_BYTES = FILE_MAX_SIZE
