import { Building } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { CompanyForm } from '@/presentation/components/admin/companies/form'
import { useCompanyFormActions } from '@/presentation/components/admin/companies/hooks/use-company-form'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const AddCompanyPage = () => {
  const formId = useId()
  const { t } = useTranslation('companies')
  const [searchParams] = useSearchParams()
  const parentCompanyId = searchParams.get('parentCompanyId') ?? undefined
  const parentCompanyName = searchParams.get('parentCompanyName') ?? undefined
  const parentCompanySlug = searchParams.get('parentCompanySlug') ?? undefined
  const { handleDiscard, handleSubmit, draftKey, isBranchCreate } = useCompanyFormActions(
    'create',
    undefined,
    { parentCompanyId, parentCompanySlug },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pageCopy = useMemo(() => {
    if (!isBranchCreate) {
      return {
        title: t('formAddTitle'),
        description: t('formAddSubtitle'),
      }
    }

    return {
      title: t('formAddBranchTitle'),
      description: parentCompanyName
        ? t('formAddBranchSubtitle', { name: parentCompanyName })
        : t('formAddBranchSubtitleGeneric'),
    }
  }, [isBranchCreate, parentCompanyName, t])

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageCopy.title}
        description={pageCopy.description}
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
        draftKey={draftKey}
        onSubmit={handleSubmit}
        onSubmittingChange={setIsSubmitting}
      />
    </div>
  )
}
