import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  createCompanyFormSchema,
  emptyCompanyFormValues,
  type CompanyFormValues,
} from '@/domain/schemas'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { CompanyDetailsSection } from './company-details-section'

export interface CompanyFormProps {
  formId: string
  mode?: 'create' | 'edit'
  defaultValues?: Partial<CompanyFormValues>
  existingLogoUrl?: string | null
  onExistingLogoRemove?: () => void
  onSubmit: (values: CompanyFormValues) => Promise<void> | void
  onSubmittingChange?: (isSubmitting: boolean) => void
}

export const CompanyForm = ({
  formId,
  mode = 'create',
  defaultValues,
  existingLogoUrl,
  onExistingLogoRemove,
  onSubmit,
  onSubmittingChange,
}: CompanyFormProps) => {
  const { t } = useTranslation('companies')

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

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...emptyCompanyFormValues,
      ...defaultValues,
    },
  })

  useEffect(() => {
    onSubmittingChange?.(isSubmitting)
  }, [isSubmitting, onSubmittingChange])

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <CompanyDetailsSection
        control={control}
        mode={mode}
        existingLogoUrl={existingLogoUrl}
        onExistingLogoRemove={onExistingLogoRemove}
      />
    </form>
  )
}
