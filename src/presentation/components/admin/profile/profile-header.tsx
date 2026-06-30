import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Camera, Mail, Phone, Settings, Shield } from 'lucide-react'
import { memo, useRef } from 'react'
import { Link } from 'react-router-dom'

import type { UserProfile } from '@/domain/entities'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/presentation/components/ui/tooltip'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { cn } from '@/presentation/utils'

interface ProfileHeaderProps {
  profile: UserProfile | null
  isLoading: boolean
  onAvatarChange: (file: File) => void
  isUploadingAvatar: boolean
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

export const ProfileHeader = memo(
  ({ profile, isLoading, onAvatarChange, isUploadingAvatar }: ProfileHeaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAvatarClick = () => {
      fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onAvatarChange(file)
        e.target.value = ''
      }
    }

    if (isLoading) {
      return <ProfileHeaderSkeleton />
    }

    if (!profile) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card"
      >
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent" />

        <div className="relative px-6 pb-6 pt-16 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="group relative"
                aria-label="Change profile picture"
              >
                <Avatar
                  className={cn(
                    'size-24 border-4 border-background shadow-lg',
                    isUploadingAvatar && 'opacity-60',
                  )}
                >
                  <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.fullName} />
                  <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-5 text-white" />
                </span>
                {isUploadingAvatar && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{profile.fullName}</h1>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="size-3.5" />
                    <span>{profile.role}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link to={ROUTES.SETTINGS.INDEX}>
                    <Settings className="size-3.5" />
                    Account Settings
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {profile.email}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Email address</TooltipContent>
                </Tooltip>

                {profile.phone && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {profile.phone}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Phone number</TooltipContent>
                  </Tooltip>
                )}

                <Badge
                  variant={profile.status === 'active' ? 'default' : 'secondary'}
                  className={cn(
                    profile.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {profile.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
                <span>Member since {format(new Date(profile.createdAt), 'MMM yyyy')}</span>
                {profile.lastLoginAt && (
                  <span>
                    Last login {format(new Date(profile.lastLoginAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  },
)

ProfileHeader.displayName = 'ProfileHeader'

const ProfileHeaderSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
    <div className="h-32 bg-gradient-to-br from-muted/40 via-muted/20 to-transparent" />
    <div className="px-6 pb-6 pt-4 sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <Skeleton className="size-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-36" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
)
