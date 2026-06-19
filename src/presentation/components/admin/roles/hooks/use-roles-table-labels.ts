import { useMemo } from 'react'

import type { PermissionsDialogLabels } from '@/presentation/components/admin/permissions'
import { buildPermissionDialogLabels } from '@/presentation/components/admin/permissions/permission-labels'
import { useTranslation } from '@/presentation/hooks/use-translation'
import type { AssignUsersDialogLabels } from '../assign-users-dialog'
import type { FeaturedRolesSectionLabels } from '../featured-roles-section'
import type { RoleUsersDialogLabels } from '../role-users-dialog'
import type { RoleStatusFilterLabels } from '../role-status-filter'
import type { RolesColumnLabels } from '../roles-columns'
import type { SetFeaturedDialogLabels } from '../set-featured-dialog'

export interface RolesTablePaginationLabels {
  showing: string
  rowsPerPage: string
  previous: string
  next: string
}

export interface RolesTableLabels {
  featured: FeaturedRolesSectionLabels
  columns: RolesColumnLabels
  statusFilter: RoleStatusFilterLabels
  pagination: RolesTablePaginationLabels
  permissions: PermissionsDialogLabels
  usersDialog: RoleUsersDialogLabels
  assignDialog: AssignUsersDialogLabels
  setFeatured: SetFeaturedDialogLabels
}

export const useRolesTableLabels = (): RolesTableLabels => {
  const { t } = useTranslation('roles')
  const { t: tCommon } = useTranslation('common')

  return useMemo(
    () => ({
      featured: {
        title: t('featuredTitle'),
        description: t('featuredDescription'),
        manageFeatured: t('manageFeatured'),
        seeAll: t('seeAll'),
        seeAllUsers: t('seeAllUsers'),
        manage: t('manageRole'),
        viewPermissions: t('viewPermissions'),
        statusActive: t('statusActive'),
        statusInactive: t('statusInactive'),
        emptyMembers: t('emptyMembers'),
        emptyFeatured: t('emptyFeatured'),
      },
      columns: {
        roleName: t('colRoleName'),
        description: t('colDescription'),
        permissions: t('colPermissions'),
        users: t('colUsers'),
        status: t('colStatus'),
        createdAt: t('colCreatedAt'),
        permissionsCount: t('permissionsCount'),
        usersMore: t('usersMore'),
        statusActive: t('statusActive'),
        statusInactive: t('statusInactive'),
        assignUser: t('assignUser'),
        edit: t('edit'),
        delete: t('delete'),
      },
      statusFilter: {
        filterStatus: t('filterStatus'),
        filterAll: t('filterAll'),
        statusActive: t('statusActive'),
        statusInactive: t('statusInactive'),
      },
      pagination: {
        showing: tCommon('paginationShowing'),
        rowsPerPage: tCommon('paginationRowsPerPage'),
        previous: tCommon('paginationPrevious'),
        next: tCommon('paginationNext'),
      },
      permissions: buildPermissionDialogLabels(t),
      usersDialog: {
        title: t('usersDialogTitle'),
        description: t('usersDialogDescription'),
        unassign: t('unassign'),
        unassignTitle: t('unassignTitle'),
        unassignDescription: t('unassignDescription'),
        confirm: t('confirm'),
        cancel: t('cancel'),
      },
      assignDialog: {
        title: t('assignDialogTitle'),
        description: t('assignDialogDescription'),
        searchPlaceholder: t('assignSearchPlaceholder'),
        assign: t('assign'),
        cancel: t('cancel'),
        loadMore: t('assignLoadMore'),
        empty: t('assignEmpty'),
      },
      setFeatured: {
        title: t('featuredDialogTitle'),
        description: t('featuredDialogDescription'),
        searchPlaceholder: t('searchPlaceholder'),
        selectedCount: t('featuredSelectedCount'),
        save: t('featuredSave'),
        cancel: t('cancel'),
        toastSuccess: t('toastFeaturedUpdated'),
        toastSuccessDesc: t('toastFeaturedUpdatedDesc'),
        toastError: t('toastFeaturedError'),
        toastMaxReached: t('featuredMaxReached'),
      },
    }),
    [t, tCommon],
  )
}
