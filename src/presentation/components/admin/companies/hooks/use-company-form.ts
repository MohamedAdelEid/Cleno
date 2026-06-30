import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { companyAdapter } from '@/application/adapters/company.adapter'
import type { CompanyFormValues } from '@/domain/schemas'
import type { ApiResult, CompanyEditDetails } from '@/domain/types'
import { companiesApi } from '@/infrastructure/api/companies.api'
import { fileUploadApi } from '@/infrastructure/api/file-upload.api'
import { draftStorage } from '@/infrastructure/storage/draft.storage'
import { notify } from '@/infrastructure/libs/toast/toast'
import type { CompanyFormSubmitPayload } from '@/presentation/components/admin/companies/form/company-form'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

const getDraftKey = (mode: 'create' | 'edit', companyId?: string, parentCompanyId?: string) => {
  if (mode === 'create') {
    return parentCompanyId ? `companies.create.branch.${parentCompanyId}` : 'companies.create'
  }

  return `companies.edit.${companyId ?? 'unknown'}`
}

const getErrorDescription = (result: ApiResult<unknown>, fallback: string) => {
  const validationMessage = result.error?.validationErrors
    ?.map((item) => item.message)
    .filter(Boolean)
    .join('\n')

  return validationMessage || result.error?.message || fallback
}

export interface UseCompanyFormActionsOptions {
  parentCompanyId?: string
  parentCompanySlug?: string
}

export const useCompanyFormActions = (
  mode: 'create' | 'edit',
  companyId?: string,
  options: UseCompanyFormActionsOptions = {},
) => {
  const { parentCompanyId, parentCompanySlug } = options
  const navigate = useNavigate()
  const { t } = useTranslation('companies')
  const draftKey = getDraftKey(mode, companyId, parentCompanyId)
  const isBranchCreate = mode === 'create' && !!parentCompanyId

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
    navigate(
      isBranchCreate && parentCompanySlug
        ? ROUTES.COMPANIES.DETAILS.replace(':companySlug', parentCompanySlug)
        : ROUTES.COMPANIES.INDEX,
    )
  }

  const handleSubmit = async ({
    values,
    uploadedFiles,
    existingFilePaths,
  }: CompanyFormSubmitPayload): Promise<boolean> => {
    if (mode === 'create') {
      const result = await companiesApi.create(
        companyAdapter.toCreateRequest(values, uploadedFiles, { parentCompanyId }),
      )

      if (!result.hasValue) {
        notify.error({
          title: isBranchCreate ? t('toastBranchCreateFailed') : t('toastCompanyCreateFailed'),
          description: getErrorDescription(
            result,
            isBranchCreate ? t('toastBranchCreateFailedDesc') : t('toastCompanyCreateFailedDesc'),
          ),
        })
        return false
      }

      notify.success({
        title: isBranchCreate ? t('toastBranchCreated') : t('toastCompanyCreated'),
        description: isBranchCreate
          ? t('toastBranchCreatedDesc', { name: values.businessName })
          : t('toastCompanyCreatedDesc', { name: values.businessName }),
      })

      draftStorage.remove(draftKey)
      navigate(ROUTES.COMPANIES.INDEX)
      return true
    }

    if (!companyId) return false

    const result = await companiesApi.update(
      companyId,
      companyAdapter.toUpdateRequest(values, uploadedFiles, existingFilePaths),
    )

    if (!result.hasValue) {
      notify.error({
        title: t('toastCompanyUpdateFailed'),
        description: getErrorDescription(result, t('toastCompanyUpdateFailedDesc')),
      })
      return false
    }

    notify.success({
      title: t('toastCompanyUpdated'),
      description: t('toastCompanyUpdatedDesc', { name: values.businessName }),
    })

    draftStorage.remove(draftKey)
    navigate(ROUTES.COMPANIES.INDEX)
    return true
  }

  return { handleDiscard, handleSubmit, draftKey, isBranchCreate }
}

export const mapCompanyToFormValues = (
  company: CompanyEditDetails,
): Partial<CompanyFormValues> => ({
  businessName: company.businessName,
  businessType: company.type,
  mainContactPerson: company.mainContactPerson,
  phone: company.phone,
  email: company.email,
  password: '',
  address: company.address,
  googleMapLink: company.googleMapLink,
  logo: [],
  commercialRegistration: [],
  isActive: company.isActive,
})
