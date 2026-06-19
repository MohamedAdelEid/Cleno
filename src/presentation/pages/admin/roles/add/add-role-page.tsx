import { RoleForm } from '@/presentation/components/admin/roles/form'
import {
  useRoleFormActions,
  useRoleFormLabels,
} from '@/presentation/components/admin/roles/hooks/use-role-form'
import { useRolePermissions } from '@/presentation/components/admin/roles/hooks/use-role-permissions'

export const AddRolePage = () => {
  const labels = useRoleFormLabels()
  const { handleDiscard, handleSubmit } = useRoleFormActions('create')
  const { groups, isLoading, error } = useRolePermissions()

  return (
    <RoleForm
      mode="create"
      labels={labels}
      permissionGroups={groups}
      permissionsLoading={isLoading}
      permissionsLoadError={error}
      onDiscard={handleDiscard}
      onSubmit={handleSubmit}
    />
  )
}
