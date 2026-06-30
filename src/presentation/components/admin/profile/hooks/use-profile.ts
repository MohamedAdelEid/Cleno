import { useCallback, useEffect, useState } from 'react'

import type { ProfileActivity, UserProfile } from '@/domain/entities'
import { useAuthStore } from '@/presentation/store'
import {
  DUMMY_ACTIVITIES,
  DUMMY_PROFILE,
  mockDelay,
} from '../profile.data'

const mergeAuthUser = (profile: UserProfile): UserProfile => {
  const authUser = useAuthStore.getState().user
  if (!authUser) return profile

  return {
    ...profile,
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.fullName,
    role: authUser.role,
    avatarUrl: authUser.avatarUrl,
  }
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<ProfileActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    await mockDelay()
    setProfile(mergeAuthUser(DUMMY_PROFILE))
    setIsLoading(false)
  }, [])

  const fetchActivities = useCallback(async () => {
    setIsActivitiesLoading(true)
    await mockDelay()
    setActivities(DUMMY_ACTIVITIES)
    setIsActivitiesLoading(false)
  }, [])

  const updateProfile = useCallback(
    async (values: {
      fullName: string
      email: string
      phone: string
    }): Promise<{ success: boolean }> => {
      await mockDelay(300)
      setProfile((current) =>
        current
          ? {
              ...current,
              fullName: values.fullName,
              email: values.email,
              phone: values.phone,
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
      return { success: true }
    },
    [],
  )

  const updateAvatar = useCallback(
    async (file: File): Promise<{ success: boolean; error?: string }> => {
      await mockDelay(500)
      const previewUrl = URL.createObjectURL(file)
      setProfile((current) => (current ? { ...current, avatarUrl: previewUrl } : null))
      return { success: true }
    },
    [],
  )

  const removeAvatar = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    await mockDelay(300)
    setProfile((current) => (current ? { ...current, avatarUrl: null } : null))
    return { success: true }
  }, [])

  useEffect(() => {
    void fetchProfile()
    void fetchActivities()
  }, [fetchProfile, fetchActivities])

  return {
    profile,
    activities,
    isLoading,
    isActivitiesLoading,
    updateProfile,
    updateAvatar,
    removeAvatar,
    refetch: fetchProfile,
    refetchActivities: fetchActivities,
  }
}
