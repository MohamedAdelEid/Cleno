export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  users: {
    me: '/users/me',
    byId: (id: string) => `/users/${id}`,
  },
  permissions: {
    list: '/Permissions',
  },
  roles: {
    create: '/Roles/create',
    all: '/Roles/all',
    setFeatured: '/Roles/set-featured',
    assignUser: '/Roles/assign-user',
    unassignUser: '/Roles/unassign-user',
    users: (roleId: string) => `/Roles/${roleId}/users`,
    availableUsers: (roleId: string) => `/Roles/${roleId}/available-users`,
    byId: (roleId: string) => `/Roles/${roleId}`,
  },
  companies: {
    adminAll: '/Companies/admin/all',
    toggleActive: '/Companies/toggle-active',
    delete: '/Companies',
    approve: '/Companies/approve',
    reject: '/Companies/reject',
  },
  fileUpload: {
    upload: '/FileUpload/upload',
    uploadMultiple: '/FileUpload/upload-multiple',
    delete: '/FileUpload/delete',
    deleteFolder: '/FileUpload/delete-folder',
  },
} as const
