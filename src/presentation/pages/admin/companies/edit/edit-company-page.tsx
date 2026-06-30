import { Building } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { CompanyForm } from '@/presentation/components/admin/companies/form'
import {
  mapCompanyToFormValues,
  useCompanyFormActions,
} from '@/presentation/components/admin/companies/hooks/use-company-form'
import type { CompanyEditDetails, RemoteFileReference } from '@/domain/types'
import { companiesApi } from '@/infrastructure/api/companies.api'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

const EditCompanySkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>
    <Skeleton className="h-[32rem] w-full rounded-xl" />
  </div>
)

export const EditCompanyPage = () => {
  const formId = useId()
  const { companyId } = useParams<{ companyId: string }>()
  const { t } = useTranslation('companies')
  const { handleDiscard, handleSubmit, draftKey } = useCompanyFormActions('edit', companyId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [company, setCompany] = useState<CompanyEditDetails | null>(null)
  const [isLoading, setIsLoading] = useState(!!companyId)
  const [existingLogo, setExistingLogo] = useState<RemoteFileReference | null>(null)
  const [existingCommercialRegistration, setExistingCommercialRegistration] =
    useState<RemoteFileReference | null>(null)

  useEffect(() => {
    if (!companyId) {
      return
    }

    let cancelled = false

    const loadCompany = async () => {
      setIsLoading(true)
      const result = await companiesApi.getForEdit(companyId)

      if (cancelled) return

      if (result.hasValue && result.data) {
        setCompany(result.data)
        setExistingLogo(result.data.photo)
        setExistingCommercialRegistration(result.data.commercialRegistration)
      } else {
        setCompany(null)
      }

      setIsLoading(false)
    }

    void loadCompany()

    return () => {
      cancelled = true
    }
  }, [companyId])

  if (isLoading) {
    return <EditCompanySkeleton />
  }

  if (!company) {
    return <Navigate to={ROUTES.COMPANIES.INDEX} replace />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('formEditTitle')}
        description={t('formEditSubtitle', { name: company.businessName })}
        icon={Building}
        action={
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDiscard()}
              disabled={isSubmitting}
            >
              {t('formDiscard')}
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {t('formSaveChanges')}
            </Button>
          </div>
        }
      />

      <CompanyForm
        formId={formId}
        mode="edit"
        draftKey={draftKey}
        defaultValues={mapCompanyToFormValues(company)}
        existingLogoUrl={existingLogo?.url ?? null}
        existingLogoPath={existingLogo?.path ?? null}
        existingCommercialRegistrationUrl={existingCommercialRegistration?.url ?? null}
        existingCommercialRegistrationPath={existingCommercialRegistration?.path ?? null}
        onExistingLogoRemove={() => setExistingLogo(null)}
        onExistingCommercialRegistrationRemove={() => setExistingCommercialRegistration(null)}
        onSubmit={handleSubmit}
        onSubmittingChange={setIsSubmitting}
      />
    </div>
  )
}
