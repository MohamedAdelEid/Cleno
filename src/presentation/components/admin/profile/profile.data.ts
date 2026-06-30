import type { ActiveSession, ProfileActivity, UserProfile } from '@/domain/entities'
import { Role } from '@/domain/enums'

const now = new Date()
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()

export const DUMMY_PROFILE: UserProfile = {
  id: 'usr-7f3a9c2e-4b1d-4e8a-9f6c-1a2b3c4d5e6f',
  email: 'admin@cleno.com',
  fullName: 'Mohamed Hassan',
  username: 'mohamed.hassan',
  phone: '+966 50 123 4567',
  role: Role.Admin,
  avatarUrl: null,
  status: 'active',
  createdAt: daysAgo(180),
  updatedAt: daysAgo(2),
  lastLoginAt: hoursAgo(3),
  permissions: [
    'users.view',
    'users.create',
    'users.edit',
    'orders.view',
    'orders.manage',
    'companies.view',
    'companies.manage',
    'drivers.view',
    'roles.view',
    'dashboard.view',
  ],
}

export const DUMMY_ACTIVITIES: ProfileActivity[] = [
  {
    id: 'act-1',
    type: 'login',
    description: 'Logged in from Chrome on Windows',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0',
    createdAt: hoursAgo(3),
  },
  {
    id: 'act-2',
    type: 'profile_update',
    description: 'Updated profile information',
    ipAddress: '192.168.1.42',
    userAgent: null,
    createdAt: daysAgo(2),
  },
  {
    id: 'act-3',
    type: 'password_change',
    description: 'Changed account password',
    ipAddress: '192.168.1.42',
    userAgent: null,
    createdAt: daysAgo(14),
  },
  {
    id: 'act-4',
    type: 'settings_update',
    description: 'Updated notification preferences',
    ipAddress: '10.0.0.15',
    userAgent: null,
    createdAt: daysAgo(21),
  },
  {
    id: 'act-5',
    type: 'login',
    description: 'Logged in from Safari on iPhone',
    ipAddress: '10.0.0.15',
    userAgent: null,
    createdAt: daysAgo(30),
  },
]

export const DUMMY_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-1',
    device: 'desktop',
    browser: 'Chrome',
    os: 'Windows 11',
    ipAddress: '192.168.1.42',
    location: 'Riyadh, SA',
    lastActivity: hoursAgo(1),
    isCurrent: true,
  },
  {
    id: 'sess-2',
    device: 'mobile',
    browser: 'Safari',
    os: 'iOS 18',
    ipAddress: '10.0.0.15',
    location: 'Jeddah, SA',
    lastActivity: daysAgo(3),
    isCurrent: false,
  },
  {
    id: 'sess-3',
    device: 'laptop',
    browser: 'Firefox',
    os: 'macOS',
    ipAddress: '172.16.0.8',
    location: 'Dubai, AE',
    lastActivity: daysAgo(7),
    isCurrent: false,
  },
]

const MOCK_DELAY_MS = 400

export const mockDelay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
