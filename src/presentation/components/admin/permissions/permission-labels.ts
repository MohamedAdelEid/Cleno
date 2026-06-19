import type { PermissionGroupKey } from '@/domain/constants/permission-groups'
import type { Permission } from '@/domain/types/permission.type'

export interface PermissionLabels {
  permissionUsersView: string
  permissionUsersCreate: string
  permissionRolesView: string
  permissionRolesCreate: string
  permissionBranchesView: string
  permissionBranchesCreate: string
  permissionOrdersView: string
  permissionOrdersUpdate: string
  permissionLaundryView: string
  permissionCustomersView: string
  permissionSettingsView: string
  groupUsers: string
  groupRoles: string
  groupBranches: string
  groupOrders: string
  groupLaundry: string
  groupCustomers: string
  groupSettings: string
  permissionSettingsFor: string
  groupEmpty: string
  selectAll: string
}

export const permissionLabelKey: Record<Permission, keyof PermissionLabels> = {
  'users.view': 'permissionUsersView',
  'users.create': 'permissionUsersCreate',
  'roles.view': 'permissionRolesView',
  'roles.create': 'permissionRolesCreate',
  'branches.view': 'permissionBranchesView',
  'branches.create': 'permissionBranchesCreate',
  'orders.view': 'permissionOrdersView',
  'orders.update': 'permissionOrdersUpdate',
  'laundry.view': 'permissionLaundryView',
  'customers.view': 'permissionCustomersView',
  'settings.view': 'permissionSettingsView',
}

export const groupLabelKey: Record<PermissionGroupKey, keyof PermissionLabels> = {
  users: 'groupUsers',
  roles: 'groupRoles',
  branches: 'groupBranches',
  orders: 'groupOrders',
  laundry: 'groupLaundry',
  customers: 'groupCustomers',
  settings: 'groupSettings',
}

export const getPermissionLabel = (permission: Permission, labels: PermissionLabels) =>
  labels[permissionLabelKey[permission]]

export const getGroupLabel = (groupKey: PermissionGroupKey, labels: PermissionLabels) =>
  labels[groupLabelKey[groupKey]]

type TranslateFn = (key: string) => string

export const buildPermissionLabels = (t: TranslateFn): PermissionLabels => ({
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
  selectAll: t('selectAll'),
})

export const buildPermissionDialogLabels = (t: TranslateFn) => ({
  ...buildPermissionLabels(t),
  addPermission: t('addPermission'),
})
