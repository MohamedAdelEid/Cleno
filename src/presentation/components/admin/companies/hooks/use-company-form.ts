import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ManagedCompany } from '@/domain/entities'
import type { CompanyFormValues } from '@/domain/schemas'
import { draftStorage } from '@/infrastructure/storage/draft.storage'
import { fileUploadApi } from '@/infrastructure/api/file-upload.api'
import { notify } from '@/infrastructure/libs/toast/toast'
import type { CompanyFormSubmitPayload } from '@/presentation/components/admin/companies/form/company-form'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

const getDraftKey = (mode: 'create' | 'edit', companyId?: string) =>
  mode === 'create' ? 'companies.create' : `companies.edit.${companyId ?? 'unknown'}`

export const useCompanyFormActions = (mode: 'create' | 'edit', companyId?: string) => {
  const navigate = useNavigate()
  const { t } = useTranslation('companies')
  const draftKey = getDraftKey(mode, companyId)

  const cleanupDraftFiles = useCallback(async () => {
    const draft = draftStorage.get(draftKey)
    if (!draft?.uploadedFiles) return

    await Promise.all(
      Object.values(draft.uploadedFiles).map((file) => fileUploadApi.delete(file.filePath)),
    )
  }, [draftKey])

  const handleDiscard = async () => {
    await cleanupDraftFiles()
    draftStorage.remove(draftKey)
    navigate(ROUTES.COMPANIES.INDEX)
  }

  const handleSubmit = async ({ values, uploadedFiles }: CompanyFormSubmitPayload) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    void values
    void uploadedFiles

    notify.success({
      title: mode === 'create' ? t('toastCompanyCreated') : t('toastCompanyUpdated'),
      description:
        mode === 'create'
          ? t('toastCompanyCreatedDesc', { name: values.businessName })
          : t('toastCompanyUpdatedDesc', { name: values.businessName }),
    })

    draftStorage.remove(draftKey)
    navigate(ROUTES.COMPANIES.INDEX)
  }

  return { handleDiscard, handleSubmit, draftKey }
}

export const mapCompanyToFormValues = (company: ManagedCompany): Partial<CompanyFormValues> => ({
  businessName: company.name,
  businessType: company.type,
  mainContactPerson: company.responsible.fullName,
  phone: company.phone,
  email: company.email,
  password: '',
  address: '',
  googleMapLink: '',
  logo: [],
  commercialRegistration: [],
  isActive: company.isActive,
})
