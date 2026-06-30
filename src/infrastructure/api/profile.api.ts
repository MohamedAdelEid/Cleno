import type {
  ActiveSessionDto,
  AppearancePreferencesDto,
  ChangePasswordRequestDto,
  GeneralPreferencesDto,
  NotificationPreferencesDto,
  ProfileActivityDto,
  ProfileDto,
  TwoFactorStatusDto,
  UpdateProfileRequestDto,
} from '@/application/dtos/profile/profile.dto'
import { profileAdapter } from '@/application/adapters/profile.adapter'
import type { ActiveSession, ProfileActivity, UserProfile } from '@/domain/entities'
import type {
  AppearancePreferences,
  GeneralPreferences,
  NotificationPreferences,
  TwoFactorStatus,
} from '@/domain/types'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export const profileApi = {
  async getProfile(): Promise<ApiResult<UserProfile>> {
    const result = await httpClient.get<ProfileDto>({
      url: API_ENDPOINTS.profile.me,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toProfile(result.data) }
  },

  async updateProfile(payload: UpdateProfileRequestDto): Promise<ApiResult<UserProfile>> {
    const result = await httpClient.put<ProfileDto>({
      url: API_ENDPOINTS.profile.update,
      data: payload,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toProfile(result.data) }
  },

  changePassword(payload: ChangePasswordRequestDto): Promise<ApiResult<boolean>> {
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.profile.changePassword,
      data: payload,
    })
  },

  async updateAvatar(avatarPath: string): Promise<ApiResult<UserProfile>> {
    const result = await httpClient.patch<ProfileDto>({
      url: API_ENDPOINTS.profile.avatar,
      data: { avatarPath },
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toProfile(result.data) }
  },

  removeAvatar(): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.profile.avatar,
    })
  },

  async getActivity(params?: { limit?: number }): Promise<ApiResult<ProfileActivity[]>> {
    const result = await httpClient.get<ProfileActivityDto[]>({
      url: API_ENDPOINTS.profile.activity,
      params: params as Record<string, unknown>,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toActivities(result.data) }
  },

  async getSessions(): Promise<ApiResult<ActiveSession[]>> {
    const result = await httpClient.get<ActiveSessionDto[]>({
      url: API_ENDPOINTS.profile.sessions,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toSessions(result.data) }
  },

  revokeSession(sessionId: string): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.profile.sessionById(sessionId),
    })
  },

  revokeAllSessions(): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.profile.sessionsAll,
    })
  },

  async getTwoFactorStatus(): Promise<ApiResult<TwoFactorStatus>> {
    const result = await httpClient.get<TwoFactorStatusDto>({
      url: API_ENDPOINTS.profile.twoFactor,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toTwoFactorStatus(result.data) }
  },

  toggleTwoFactor(enabled: boolean): Promise<ApiResult<boolean>> {
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.profile.twoFactor,
      data: { enabled },
    })
  },

  async getNotificationPreferences(): Promise<ApiResult<NotificationPreferences>> {
    const result = await httpClient.get<NotificationPreferencesDto>({
      url: API_ENDPOINTS.profile.notifications,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toNotificationPreferences(result.data) }
  },

  updateNotificationPreferences(
    payload: NotificationPreferencesDto,
  ): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.profile.notifications,
      data: payload,
    })
  },

  async getAppearancePreferences(): Promise<ApiResult<AppearancePreferences>> {
    const result = await httpClient.get<AppearancePreferencesDto>({
      url: API_ENDPOINTS.profile.appearance,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toAppearancePreferences(result.data) }
  },

  updateAppearancePreferences(payload: AppearancePreferencesDto): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.profile.appearance,
      data: payload,
    })
  },

  async getGeneralPreferences(): Promise<ApiResult<GeneralPreferences>> {
    const result = await httpClient.get<GeneralPreferencesDto>({
      url: API_ENDPOINTS.profile.preferences,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return { ...result, data: profileAdapter.toGeneralPreferences(result.data) }
  },

  updateGeneralPreferences(payload: GeneralPreferencesDto): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.profile.preferences,
      data: payload,
    })
  },
}
