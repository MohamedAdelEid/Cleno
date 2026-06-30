import { Plus, Building } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  CompaniesOverviewSection,
  CompaniesTableSection,
} from '@/presentation/components/admin/companies'
import { useCompanies } from '@/presentation/components/admin/companies/hooks/use-companies'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const CompaniesPage = () => {
  const { t } = useTranslation('companies')
  const [searchParams] = useSearchParams()
  const searchFromUrl = searchParams.get('search') ?? ''
  const {
    companies,
    stats,
    totalRows,
    isLoading,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    activeFilter,
    setActiveFilter,
    paginationState,
    setPaginationState,
    refetch,
  } = useCompanies({ initialKeyword: searchFromUrl })

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

      <CompaniesOverviewSection stats={stats} isLoading={isLoading} />
      <CompaniesTableSection
        companies={companies}
        totalRows={totalRows}
        isLoading={isLoading}
        onRefetch={refetch}
        search={keyword}
        onSearchChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        paginationState={paginationState}
        onPaginationStateChange={setPaginationState}
      />
    </div>
  )
}
