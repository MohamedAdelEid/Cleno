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
  OPERATIONAL_BAGS: {
    INDEX: '/dashboard/operational-bags',
  },
  CUSTOMERS: {
    INDEX: '/dashboard/customers',
  },
  COMPANIES: {
    INDEX: '/dashboard/companies',
    NEW: '/dashboard/companies/new',
    newWithParent: (
      parentCompanyId: string,
      options?: { parentCompanyName?: string; parentCompanySlug?: string },
    ) => {
      const params = new URLSearchParams({ parentCompanyId })
      if (options?.parentCompanyName) params.set('parentCompanyName', options.parentCompanyName)
      if (options?.parentCompanySlug) params.set('parentCompanySlug', options.parentCompanySlug)
      return `/dashboard/companies/new?${params.toString()}`
    },
    EDIT: '/dashboard/companies/:companyId/edit',
    DETAILS: '/dashboard/companies/:companySlug',
  },
  SETTINGS: {
    INDEX: '/dashboard/settings',
  },
  NOT_FOUND: '*',
} as const
