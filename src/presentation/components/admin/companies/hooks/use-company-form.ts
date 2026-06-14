import { useNavigate } from 'react-router-dom'

import type { ManagedCompany } from '@/domain/entities'
import type { CompanyFormValues } from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const useCompanyFormActions = (mode: 'create' | 'edit') => {
  const navigate = useNavigate()
  const { t } = useTranslation('companies')

  const handleDiscard = () => {
    navigate(ROUTES.COMPANIES.INDEX)
  }

  const handleSubmit = async (values: CompanyFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    notify.success({
      title: mode === 'create' ? t('toastCompanyCreated') : t('toastCompanyUpdated'),
      description:
        mode === 'create'
          ? t('toastCompanyCreatedDesc', { name: values.businessName })
          : t('toastCompanyUpdatedDesc', { name: values.businessName }),
    })

    navigate(ROUTES.COMPANIES.INDEX)
  }

  return { handleDiscard, handleSubmit }
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
