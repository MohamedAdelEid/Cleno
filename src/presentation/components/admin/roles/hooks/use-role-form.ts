import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { roleAdapter } from '@/application/adapters/role.adapter'
import type { RoleFormValues } from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { rolesApi } from '@/infrastructure/api/roles.api'
import { type RoleFormLabels } from '@/presentation/components/admin/roles/form'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { buildPermissionLabels } from '@/presentation/components/admin/permissions/permission-labels'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const useRoleFormLabels = (): RoleFormLabels => {
  const { t } = useTranslation('roles')

  return useMemo(
    () => ({
      ...buildPermissionLabels(t),
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
      permissionsLoadError: t('permissionsLoadError'),
      validationNameRequired: t('validationNameRequired'),
      validationNameMin: t('validationNameMin'),
      validationNameMax: t('validationNameMax'),
      validationDescriptionRequired: t('validationDescriptionRequired'),
      validationDescriptionMin: t('validationDescriptionMin'),
      validationDescriptionMax: t('validationDescriptionMax'),
      validationPermissionsRequired: t('validationPermissionsRequired'),
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

  const handleSubmit = async (values: RoleFormValues, roleSlug?: string) => {
    if (mode === 'create') {
      const result = await rolesApi.create(roleAdapter.toCreateRequest(values))

      if (!result.hasValue || !result.data) {
        notify.error({
          title: t('toastRoleCreateFailed'),
          description: result.error?.message ?? t('toastRoleCreateFailedDesc'),
        })
        return
      }

      notify.success({
        title: t('toastRoleCreated'),
        description: t('toastRoleCreatedDesc', { name: values.name }),
      })

      navigate(ROUTES.ROLES.INDEX)
      return
    }

    if (!roleSlug) return

    const result = await rolesApi.assignPermissions(roleSlug, values.permissionIds)

    if (!result.hasValue) {
      notify.error({
        title: t('toastRoleUpdateFailed'),
        description: result.error?.message ?? t('toastRoleUpdateFailedDesc'),
      })
      return
    }

    notify.success({
      title: t('toastRoleUpdated'),
      description: t('toastRoleUpdatedDesc', { name: values.name }),
    })

    navigate(ROUTES.ROLES.INDEX)
  }

  return { handleDiscard, handleSubmit }
}
