import { Navigate, useParams } from 'react-router-dom'

import { RoleForm } from '@/presentation/components/admin/roles/form'
import {
  useRoleFormActions,
  useRoleFormLabels,
} from '@/presentation/components/admin/roles/hooks/use-role-form'
import { useRoleDetails } from '@/presentation/components/admin/roles/hooks/use-role-details'
import { useRolePermissions } from '@/presentation/components/admin/roles/hooks/use-role-permissions'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { ROUTES } from '@/presentation/routes/routes.constants'

const EditRoleSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <Skeleton className="h-64 w-full rounded-xl" />
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
)

export const EditRolePage = () => {
  const { roleId } = useParams<{ roleId: string }>()
  const labels = useRoleFormLabels()
  const { handleDiscard, handleSubmit } = useRoleFormActions('edit')
  const { groups, isLoading: permissionsLoading, error: permissionsError } = useRolePermissions()
  const { role, isLoading: roleLoading } = useRoleDetails(roleId)

  if (roleLoading || permissionsLoading) {
    return <EditRoleSkeleton />
  }

  if (!role) {
    return <Navigate to={ROUTES.ROLES.INDEX} replace />
  }

  return (
    <RoleForm
      mode="edit"
      labels={labels}
      permissionGroups={groups}
      permissionsLoading={permissionsLoading}
      permissionsLoadError={permissionsError}
      defaultValues={{
        name: role.name,
        description: role.description,
        status: role.status,
        permissionIds: [],
      }}
      onDiscard={handleDiscard}
      onSubmit={handleSubmit}
    />
  )
}
