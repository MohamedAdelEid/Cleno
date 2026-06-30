import { User } from 'lucide-react'
import { useCallback, useState } from 'react'

import {
  AccountInfoCard,
  ActivityTimeline,
  ProfileHeader,
  useProfile,
} from '@/presentation/components/admin/profile'
import { PageHeader } from '@/presentation/components/layout'

export const ProfilePage = () => {
  const { profile, activities, isLoading, isActivitiesLoading, updateAvatar } = useProfile()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleAvatarChange = useCallback(
    async (file: File) => {
      setIsUploadingAvatar(true)
      await updateAvatar(file)
      setIsUploadingAvatar(false)
    },
    [updateAvatar],
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="View and manage your account" icon={User} />

      <ProfileHeader
        profile={profile}
        isLoading={isLoading}
        onAvatarChange={(file) => void handleAvatarChange(file)}
        isUploadingAvatar={isUploadingAvatar}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <AccountInfoCard profile={profile} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-3">
          <ActivityTimeline activities={activities} isLoading={isActivitiesLoading} />
        </div>
      </div>
    </div>
  )
}
