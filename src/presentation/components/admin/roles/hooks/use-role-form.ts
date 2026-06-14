import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import type { RoleFormValues } from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { type RoleFormLabels } from '@/presentation/components/admin/roles/form'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const useRoleFormLabels = (): RoleFormLabels => {
  const { t } = useTranslation('roles')

  return useMemo(
    () => ({
      addTitle: t('formAddTitle'),
      editTitle: t('formEditTitle'),
      addSubtitle: t('formAddSubtitle'),
      editSubtitle: t('formEditSubtitle'),
      discard: t('formDiscard'),
      saveChanges: t('formSaveChanges'),
      detailsTitle: t('formDetailsTitle'),
      detailsDescription: t('formDetailsDescription'),
      formRoleName: t('formRoleName'),
      formDescription: t('formDescription'),
      formStatus: t('formStatus'),
      statusActive: t('statusActive'),
      statusInactive: t('statusInactive'),
      permissionsTitle: t('formPermissionsTitle'),
      permissionsDescription: t('formPermissionsDescription'),
      selectAll: t('selectAll'),
      validationNameRequired: t('validationNameRequired'),
      validationNameMin: t('validationNameMin'),
      validationNameMax: t('validationNameMax'),
      validationDescriptionRequired: t('validationDescriptionRequired'),
      validationDescriptionMin: t('validationDescriptionMin'),
      validationDescriptionMax: t('validationDescriptionMax'),
      validationPermissionsRequired: t('validationPermissionsRequired'),
      permissionUsersView: t('permissionUsersView'),
      permissionUsersCreate: t('permissionUsersCreate'),
      permissionRolesView: t('permissionRolesView'),
      permissionRolesCreate: t('permissionRolesCreate'),
      permissionBranchesView: t('permissionBranchesView'),
      permissionBranchesCreate: t('permissionBranchesCreate'),
      permissionOrdersView: t('permissionOrdersView'),
      permissionOrdersUpdate: t('permissionOrdersUpdate'),
      permissionLaundryView: t('permissionLaundryView'),
      permissionCustomersView: t('permissionCustomersView'),
      permissionSettingsView: t('permissionSettingsView'),
      groupUsers: t('groupUsers'),
      groupRoles: t('groupRoles'),
      groupBranches: t('groupBranches'),
      groupOrders: t('groupOrders'),
      groupLaundry: t('groupLaundry'),
      groupCustomers: t('groupCustomers'),
      groupSettings: t('groupSettings'),
      permissionSettingsFor: t('permissionSettingsFor'),
      groupEmpty: t('groupEmpty'),
    }),
    [t],
  )
}

export const useRoleFormActions = (mode: 'create' | 'edit') => {
  const navigate = useNavigate()
  const { t } = useTranslation('roles')

  const handleDiscard = () => {
    navigate(ROUTES.ROLES.INDEX)
  }

  const handleSubmit = async (values: RoleFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    notify.success({
      title: mode === 'create' ? t('toastRoleCreated') : t('toastRoleUpdated'),
      description:
        mode === 'create'
          ? t('toastRoleCreatedDesc', { name: values.name })
          : t('toastRoleUpdatedDesc', { name: values.name }),
    })

    navigate(ROUTES.ROLES.INDEX)
  }

  return { handleDiscard, handleSubmit }
}
