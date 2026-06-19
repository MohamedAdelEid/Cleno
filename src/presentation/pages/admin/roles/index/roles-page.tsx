import { Plus, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

import { RolesTableSection } from '@/presentation/components/admin/roles'
import { useRoles } from '@/presentation/components/admin/roles/hooks/use-roles'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const RolesPage = () => {
  const { t } = useTranslation('roles')
  const {
    roles,
    featuredRoles,
    totalRows,
    isInitialLoading,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    paginationState,
    setPaginationState,
    refetch,
  } = useRoles()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={Shield}
        action={
          <Button asChild>
            <Link to={ROUTES.ROLES.NEW}>
              <Plus />
              {t('addRole')}
            </Link>
          </Button>
        }
      />
      <RolesTableSection
        roles={roles}
        featuredRoles={featuredRoles}
        totalRows={totalRows}
        isLoading={isInitialLoading}
        onRefetch={refetch}
        search={keyword}
        onSearchChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paginationState={paginationState}
        onPaginationStateChange={setPaginationState}
      />
    </div>
  )
}
