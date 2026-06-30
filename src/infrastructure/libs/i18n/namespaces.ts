export const NAMESPACES = {
  common: 'common',
  auth: 'auth',
  navigation: 'navigation',
  dashboard: 'dashboard',
  roles: 'roles',
  companies: 'companies',
  orders: 'orders',
  laundry: 'laundry',
  operationalBags: 'operationalBags',
  users: 'users',
  drivers: 'drivers',
  incidents: 'incidents',
  timeSlots: 'timeSlots',
  laundryItems: 'laundryItems',
  profile: 'profile',
  settings: 'settings',
} as const

export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES]
