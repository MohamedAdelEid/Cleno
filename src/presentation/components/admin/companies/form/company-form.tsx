import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { UploadedFile } from '@/domain/types'
import {
  createCompanyFormSchema,
  emptyCompanyFormValues,
  type CompanyFormValues,
} from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { useFormDraft } from '@/presentation/hooks/use-form-draft'
import { CompanyDetailsSection } from './company-details-section'

export type CompanyUploadField = 'logo' | 'commercialRegistration'

export interface CompanyFormSubmitPayload {
  values: CompanyFormValues
  uploadedFiles: Partial<Record<CompanyUploadField, UploadedFile>>
}

export interface CompanyFormProps {
  formId: string
  mode?: 'create' | 'edit'
  draftKey: string
  defaultValues?: Partial<CompanyFormValues>
  existingLogoUrl?: string | null
  existingLogoPath?: string | null
  onExistingLogoRemove?: () => void
  onSubmit: (payload: CompanyFormSubmitPayload) => Promise<boolean | void> | boolean | void
  onSubmittingChange?: (isSubmitting: boolean) => void
}

const stripFilesFromValues = (values: CompanyFormValues): CompanyFormValues => ({
  ...values,
  logo: [],
  commercialRegistration: [],
})

export const CompanyForm = ({
  formId,
  mode = 'create',
  draftKey,
  defaultValues,
  existingLogoUrl,
  existingLogoPath,
  onExistingLogoRemove,
  onSubmit,
  onSubmittingChange,
}: CompanyFormProps) => {
  const { t } = useTranslation('companies')
  const { draft, saveDraft, clearDraft } = useFormDraft<CompanyFormValues>({ key: draftKey })
  const draftRestoredRef = useRef(false)

  const [uploadedFiles, setUploadedFiles] = useState<
    Partial<Record<CompanyUploadField, UploadedFile>>
  >(draft?.uploadedFiles ?? {})

  const schema = useMemo(
    () =>
      createCompanyFormSchema(
        {
          businessNameRequired: t('validationBusinessNameRequired'),
          businessNameMin: t('validationBusinessNameMin'),
          businessNameMax: t('validationBusinessNameMax'),
          businessTypeRequired: t('validationBusinessTypeRequired'),
          businessTypeMin: t('validationBusinessTypeMin'),
          mainContactRequired: t('validationMainContactRequired'),
          phoneRequired: t('validationPhoneRequired'),
          emailRequired: t('validationEmailRequired'),
          emailInvalid: t('validationEmailInvalid'),
          googleMapLinkRequired: t('validationGoogleMapLinkRequired'),
          urlInvalid: t('validationUrlInvalid'),
          passwordRequired: t('validationPasswordRequired'),
          passwordMin: t('validationPasswordMin'),
          logoInvalid: t('validationLogoInvalid'),
          logoMaxSize: t('validationLogoMaxSize'),
          commercialRegistrationInvalid: t('validationCommercialRegistrationInvalid'),
          commercialRegistrationMaxSize: t('validationCommercialRegistrationMaxSize'),
        },
        { mode },
      ),
    [mode, t],
  )

  const initialValues = useMemo(
    () => ({
      ...emptyCompanyFormValues,
      ...defaultValues,
      ...(draft?.values ?? {}),
      logo: [],
      commercialRegistration: [],
    }),
    [defaultValues, draft?.values],
  )

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    onSubmittingChange?.(isSubmitting)
  }, [isSubmitting, onSubmittingChange])

  useEffect(() => {
    if (draft && !draftRestoredRef.current) {
      draftRestoredRef.current = true
      notify.info({
        title: t('draftRestored'),
        description: t('draftRestoredDesc'),
      })
    }
  }, [draft, t])

  useEffect(() => {
    const subscription = watch((values) => {
      saveDraft(stripFilesFromValues(values as CompanyFormValues), uploadedFiles as Record<string, UploadedFile>)
    })

    return () => subscription.unsubscribe()
  }, [saveDraft, uploadedFiles, watch])

  const handleUploadedFileChange = (
    field: CompanyUploadField,
    file: UploadedFile | null,
  ) => {
    setUploadedFiles((current) => {
      const next = { ...current }
      if (file) {
        next[field] = file
      } else {
        delete next[field]
      }

      saveDraft(stripFilesFromValues(getValues()), next as Record<string, UploadedFile>)
      return next
    })
  }

  const handleUploadError = (message: string) => {
    notify.error({
      title: t('uploadFailed'),
      description: message,
    })
  }

  const handleFormSubmit = handleSubmit(async (values) => {
    const result = await onSubmit({
      values: stripFilesFromValues(values),
      uploadedFiles,
    })

    if (result !== false) {
      clearDraft()
    }
  })

  return (
    <form id={formId} onSubmit={handleFormSubmit} className="space-y-5" noValidate>
      <CompanyDetailsSection
        control={control}
        mode={mode}
        existingLogoUrl={existingLogoUrl}
        existingLogoPath={existingLogoPath}
        onExistingLogoRemove={onExistingLogoRemove}
        uploadedFiles={uploadedFiles}
        onUploadedFileChange={handleUploadedFileChange}
        onUploadError={handleUploadError}
      />
    </form>
  )
}
