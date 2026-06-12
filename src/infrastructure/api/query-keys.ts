export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  users: {
    me: ['users', 'me'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
} as const
