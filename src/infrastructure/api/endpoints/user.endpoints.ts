export const USER_ENDPOINTS = {
  me: '/users/me',
  byId: (id: string) => `/users/${id}`,
} as const
