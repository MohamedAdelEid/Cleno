import { RoleForm } from '@/presentation/components/admin/roles/form'
import {
  useRoleFormActions,
  useRoleFormLabels,
} from '@/presentation/components/admin/roles/hooks/use-role-form'

export const AddRolePage = () => {
  const labels = useRoleFormLabels()
  const { handleDiscard, handleSubmit } = useRoleFormActions('create')

  return <RoleForm mode="create" labels={labels} onDiscard={handleDiscard} onSubmit={handleSubmit} />
}
