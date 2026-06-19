import { Building } from 'lucide-react'
import { useId, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { companiesDummyData } from '@/presentation/components/admin/companies/companies.data'
import { CompanyForm } from '@/presentation/components/admin/companies/form'
import {
  mapCompanyToFormValues,
  useCompanyFormActions,
} from '@/presentation/components/admin/companies/hooks/use-company-form'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const EditCompanyPage = () => {
  const formId = useId()
  const { companyId } = useParams<{ companyId: string }>()
  const { t } = useTranslation('companies')
  const { handleDiscard, handleSubmit, draftKey } = useCompanyFormActions('edit', companyId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const company = companiesDummyData.find((item) => item.id === companyId)
  const [existingLogoUrl, setExistingLogoUrl] = useState(company?.logoUrl ?? null)

  if (!company) {
    return <Navigate to={ROUTES.COMPANIES.INDEX} replace />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('formEditTitle')}
        description={t('formEditSubtitle', { name: company.name })}
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
        existingLogoUrl={existingLogoUrl}
        onExistingLogoRemove={() => setExistingLogoUrl(null)}
        onSubmit={handleSubmit}
        onSubmittingChange={setIsSubmitting}
      />
    </div>
  )
}
