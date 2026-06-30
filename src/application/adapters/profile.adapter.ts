import type {
  ActiveSessionDto,
  AppearancePreferencesDto,
  GeneralPreferencesDto,
  NotificationPreferencesDto,
  ProfileActivityDto,
  ProfileDto,
  TwoFactorStatusDto,
} from '@/application/dtos/profile/profile.dto'
import type { ActiveSession, ProfileActivity, UserProfile } from '@/domain/entities'
import type { Role } from '@/domain/enums'
import type {
  AppearancePreferences,
  GeneralPreferences,
  NotificationPreferences,
  TwoFactorStatus,
} from '@/domain/types'

const activityTypeMap: Record<string, ProfileActivity['type']> = {
  login: 'login',
  password_change: 'password_change',
  profile_update: 'profile_update',
  settings_update: 'settings_update',
  logout: 'logout',
}

export const profileAdapter = {
  toProfile(dto: ProfileDto): UserProfile {
    return {
      id: dto.id,
      email: dto.email,
      fullName: dto.fullName,
      username: dto.userName,
      phone: dto.phoneNumber,
      role: dto.role as Role,
      avatarUrl: dto.avatarUrl,
      status: dto.isActive ? 'active' : 'inactive',
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      lastLoginAt: dto.lastLoginAt,
      permissions: dto.permissions,
    }
  },

  toActivity(dto: ProfileActivityDto): ProfileActivity {
    return {
      id: dto.id,
      type: activityTypeMap[dto.type] ?? 'login',
      description: dto.description,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      createdAt: dto.createdAt,
    }
  },

  toActivities(dtos: ProfileActivityDto[]): ProfileActivity[] {
    return dtos.map(this.toActivity)
  },

  toSession(dto: ActiveSessionDto): ActiveSession {
    return {
      id: dto.id,
      device: dto.device,
      browser: dto.browser,
      os: dto.os,
      ipAddress: dto.ipAddress,
      location: dto.location,
      lastActivity: dto.lastActivity,
      isCurrent: dto.isCurrent,
    }
  },

  toSessions(dtos: ActiveSessionDto[]): ActiveSession[] {
    return dtos.map(this.toSession)
  },

  toTwoFactorStatus(dto: TwoFactorStatusDto): TwoFactorStatus {
    return {
      enabled: dto.enabled,
      verifiedAt: dto.verifiedAt,
      recoveryCodes: dto.recoveryCodes,
    }
  },

  toNotificationPreferences(dto: NotificationPreferencesDto): NotificationPreferences {
    return { ...dto }
  },

  toAppearancePreferences(dto: AppearancePreferencesDto): AppearancePreferences {
    return { ...dto }
  },

  toGeneralPreferences(dto: GeneralPreferencesDto): GeneralPreferences {
    return { ...dto }
  },
}
