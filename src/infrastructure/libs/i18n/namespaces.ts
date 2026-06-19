export const NAMESPACES = {
  common: 'common',
  auth: 'auth',
  navigation: 'navigation',
  dashboard: 'dashboard',
  roles: 'roles',
  companies: 'companies',
  orders: 'orders',
  laundry: 'laundry',
} as const

export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES]
