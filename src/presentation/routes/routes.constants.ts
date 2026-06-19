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
    NEW: '/dashboard/roles/new',
    EDIT: '/dashboard/roles/:roleId/edit',
  },
  BRANCHES: {
    INDEX: '/dashboard/branches',
  },
  ORDERS: {
    INDEX: '/dashboard/orders',
  },
  LAUNDRY: {
    INDEX: '/dashboard/laundry',
    INCIDENTS: '/dashboard/laundry/:orderId/incidents',
    INCIDENT_DETAIL: '/dashboard/laundry/:orderId/incidents/:incidentId',
  },
  CUSTOMERS: {
    INDEX: '/dashboard/customers',
  },
  COMPANIES: {
    INDEX: '/dashboard/companies',
    NEW: '/dashboard/companies/new',
    EDIT: '/dashboard/companies/:companyId/edit',
  },
  SETTINGS: {
    INDEX: '/dashboard/settings',
  },
  NOT_FOUND: '*',
} as const
