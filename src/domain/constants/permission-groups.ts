import { Permission } from '@/domain/constants/permissions'
import type { Permission as PermissionType } from '@/domain/types/permission.type'

export const PermissionGroupKey = {
  Users: 'users',
  Roles: 'roles',
  Branches: 'branches',
  Orders: 'orders',
  Laundry: 'laundry',
  Bags: 'bags',
  Customers: 'customers',
  Settings: 'settings',
} as const

export type PermissionGroupKey =
  (typeof PermissionGroupKey)[keyof typeof PermissionGroupKey]

export interface PermissionGroupDefinition {
  key: PermissionGroupKey
  permissions: PermissionType[]
}

export const PERMISSION_GROUPS: PermissionGroupDefinition[] = [
  {
    key: PermissionGroupKey.Users,
    permissions: [Permission.UsersView, Permission.UsersCreate],
  },
  {
    key: PermissionGroupKey.Roles,
    permissions: [Permission.RolesView, Permission.RolesCreate],
  },
  {
    key: PermissionGroupKey.Branches,
    permissions: [Permission.BranchesView, Permission.BranchesCreate],
  },
  {
    key: PermissionGroupKey.Orders,
    permissions: [Permission.OrdersView, Permission.OrdersUpdate],
  },
  {
    key: PermissionGroupKey.Laundry,
    permissions: [Permission.LaundryView],
  },
  {
    key: PermissionGroupKey.Bags,
    permissions: [Permission.BagsView],
  },
  {
    key: PermissionGroupKey.Customers,
    permissions: [Permission.CustomersView],
  },
  {
    key: PermissionGroupKey.Settings,
    permissions: [Permission.SettingsView],
  },
]
