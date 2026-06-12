export const ROUTES = {
  ROOT: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  DASHBOARD: {
    HOME: '/dashboard',
  },
  USERS: {
    INDEX: '/dashboard/users',
  },
  ROLES: {
    INDEX: '/dashboard/roles',
  },
  BRANCHES: {
    INDEX: '/dashboard/branches',
  },
  ORDERS: {
    INDEX: '/dashboard/orders',
  },
  LAUNDRY: {
    INDEX: '/dashboard/laundry',
  },
  CUSTOMERS: {
    INDEX: '/dashboard/customers',
  },
  SETTINGS: {
    INDEX: '/dashboard/settings',
  },
  NOT_FOUND: '*',
} as const
