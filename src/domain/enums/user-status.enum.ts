export const ManagedUserStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Suspended: 'suspended',
} as const

export type ManagedUserStatus = (typeof ManagedUserStatus)[keyof typeof ManagedUserStatus]

export const MANAGED_USER_STATUSES = Object.values(ManagedUserStatus)
