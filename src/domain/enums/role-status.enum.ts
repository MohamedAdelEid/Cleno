export const RoleStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type RoleStatus = (typeof RoleStatus)[keyof typeof RoleStatus]

export const ROLE_STATUSES = Object.values(RoleStatus)
