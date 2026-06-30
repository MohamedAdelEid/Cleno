export interface ProfileDto {
  id: string
  email: string
  fullName: string
  userName: string
  phoneNumber: string | null
  role: string
  avatarUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  permissions: string[]
}

export interface UpdateProfileRequestDto {
  fullName: string
  email: string
  phoneNumber: string
  userName: string
}

export interface ChangePasswordRequestDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileActivityDto {
  id: string
  type: string
  description: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface ActiveSessionDto {
  id: string
  device: string
  browser: string
  os: string
  ipAddress: string
  location: string | null
  lastActivity: string
  isCurrent: boolean
}

export interface TwoFactorStatusDto {
  enabled: boolean
  verifiedAt: string | null
  recoveryCodes: string[]
}

export interface NotificationPreferencesDto {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  accountUpdates: boolean
}

export interface AppearancePreferencesDto {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  compactMode: boolean
  sidebarCollapsed: boolean
  animationsEnabled: boolean
  fontSize: 'small' | 'medium' | 'large'
}

export interface GeneralPreferencesDto {
  language: string
  dateFormat: string
  timeFormat: string
  weekStartsOn: 'sunday' | 'monday' | 'saturday'
  defaultDashboardPage: string
  itemsPerPage: number
  autoRefreshInterval: number
}
