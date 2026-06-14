import { Building } from 'lucide-react'
import { useId, useState } from 'react'

import { CompanyForm } from '@/presentation/components/admin/companies/form'
import { useCompanyFormActions } from '@/presentation/components/admin/companies/hooks/use-company-form'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const AddCompanyPage = () => {
  const formId = useId()
  const { t } = useTranslation('companies')
  const { handleDiscard, handleSubmit } = useCompanyFormActions('create')
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('formAddTitle')}
        description={t('formAddSubtitle')}
        icon={Building}
        action={
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" onClick={handleDiscard} disabled={isSubmitting}>
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
        onSubmit={handleSubmit}
        onSubmittingChange={setIsSubmitting}
      />
    </div>
  )
}
