export interface UpdateProfilePayload {
  fullName: string
  email: string
  phone: string
  username: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface TwoFactorStatus {
  enabled: boolean
  verifiedAt: string | null
  recoveryCodes: string[]
}

export interface NotificationPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  accountUpdates: boolean
}

export interface AppearancePreferences {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  compactMode: boolean
  sidebarCollapsed: boolean
  animationsEnabled: boolean
  fontSize: 'small' | 'medium' | 'large'
}

export interface GeneralPreferences {
  language: string
  dateFormat: string
  timeFormat: string
  weekStartsOn: 'sunday' | 'monday' | 'saturday'
  defaultDashboardPage: string
  itemsPerPage: number
  autoRefreshInterval: number
}

export type SettingsTab = 'general' | 'security' | 'notifications' | 'appearance' | 'preferences'
