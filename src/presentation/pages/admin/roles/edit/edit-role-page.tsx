import { Navigate, useParams } from 'react-router-dom'

import { RoleForm } from '@/presentation/components/admin/roles/form'
import { rolesDummyData } from '@/presentation/components/admin/roles/roles.data'
import {
  useRoleFormActions,
  useRoleFormLabels,
} from '@/presentation/components/admin/roles/hooks/use-role-form'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const EditRolePage = () => {
  const { roleId } = useParams<{ roleId: string }>()
  const labels = useRoleFormLabels()
  const { handleDiscard, handleSubmit } = useRoleFormActions('edit')

  const role = rolesDummyData.find((item) => item.id === roleId)

  if (!role) {
    return <Navigate to={ROUTES.ROLES.INDEX} replace />
  }

  return (
    <RoleForm
      mode="edit"
      labels={labels}
      defaultValues={{
        name: role.name,
        description: role.description,
        status: role.status,
        permissions: role.permissions,
      }}
      onDiscard={handleDiscard}
      onSubmit={handleSubmit}
    />
  )
}
