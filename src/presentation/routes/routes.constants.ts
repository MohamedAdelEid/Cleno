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
    edit: (roleId: string) => `/dashboard/roles/${roleId}/edit`,
  },
  BRANCHES: {
    INDEX: '/dashboard/branches',
  },
  ORDERS: {
    INDEX: '/dashboard/orders',
    withSearch: (keyword: string) => {
      const trimmed = keyword.trim()
      if (!trimmed) return '/dashboard/orders'
      return `/dashboard/orders?${new URLSearchParams({ search: trimmed }).toString()}`
    },
  },
  LAUNDRY: {
    INDEX: '/dashboard/laundry',
  },
  INCIDENTS: {
    INDEX: '/dashboard/incidents',
  },
  OPERATIONAL_BAGS: {
    INDEX: '/dashboard/operational-bags',
  },
  DRIVERS: {
    INDEX: '/dashboard/drivers',
    withSearch: (keyword: string) => {
      const trimmed = keyword.trim()
      if (!trimmed) return '/dashboard/drivers'
      return `/dashboard/drivers?${new URLSearchParams({ search: trimmed }).toString()}`
    },
  },
  CUSTOMERS: {
    INDEX: '/dashboard/customers',
  },
  COMPANIES: {
    INDEX: '/dashboard/companies',
    withSearch: (keyword: string) => {
      const trimmed = keyword.trim()
      if (!trimmed) return '/dashboard/companies'
      return `/dashboard/companies?${new URLSearchParams({ search: trimmed }).toString()}`
    },
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
    edit: (companyId: string) => `/dashboard/companies/${companyId}/edit`,
    details: (companySlug: string) => `/dashboard/companies/${companySlug}`,
    detailsTab: (
      companySlug: string,
      tab: 'overview' | 'orders' | 'invoices' | 'branches' | 'activity' = 'overview',
      options?: { branch?: string; search?: string },
    ) => {
      const params = new URLSearchParams()
      if (tab !== 'overview') params.set('tab', tab)
      if (options?.branch) params.set('branch', options.branch)
      if (options?.search) params.set('search', options.search)
      const query = params.toString()
      const base = `/dashboard/companies/${companySlug}`
      return query ? `${base}?${query}` : base
    },
  },
  PROFILE: {
    INDEX: '/dashboard/profile',
  },
  SETTINGS: {
    INDEX: '/dashboard/settings',
    tab: (tab: 'general' | 'security' | 'notifications' | 'appearance' | 'preferences') =>
      `/dashboard/settings?${new URLSearchParams({ tab }).toString()}`,
  },
  TIME_SLOTS: {
    INDEX: '/dashboard/time-slots',
  },
  LAUNDRY_ITEMS: {
    INDEX: '/dashboard/laundry-items',
  },
  NOT_FOUND: '*',
} as const
