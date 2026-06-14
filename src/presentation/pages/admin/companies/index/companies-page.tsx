import { Plus, Building } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  CompaniesOverviewSection,
  CompaniesTableSection,
  companiesDummyData,
} from '@/presentation/components/admin/companies'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const CompaniesPage = () => {
  const { t } = useTranslation('companies')
  const [companies, setCompanies] = useState(companiesDummyData)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={Building}
        action={
          <Button asChild>
            <Link to={ROUTES.COMPANIES.NEW}>
              <Plus />
              {t('addCompany')}
            </Link>
          </Button>
        }
      />

      <CompaniesOverviewSection companies={companies} />
      <CompaniesTableSection companies={companies} setCompanies={setCompanies} />
    </div>
  )
}
