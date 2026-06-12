export const Role = {
  Company: 'company',
  Admin: 'admin',
  BranchManager: 'branch_manager',
  LaundryUser: 'laundry_user',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const DASHBOARD_ROLES = Object.values(Role)
