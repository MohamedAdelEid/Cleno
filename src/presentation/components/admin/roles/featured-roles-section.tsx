import { Info, Star } from 'lucide-react'

import type { ManagedRole } from '@/domain/entities'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { RolesOverviewSection } from './roles-overview-section'

const MAX_FEATURED = 3

export interface FeaturedRolesSectionLabels {
  title: string
  description: string
  manageFeatured: string
  seeAll: string
  seeAllUsers: string
  manage: string
  viewPermissions: string
  statusActive: string
  statusInactive: string
  emptyMembers: string
  emptyFeatured: string
}

interface FeaturedRolesSectionProps {
  featuredRoles: ManagedRole[]
  isLoading?: boolean
  labels: FeaturedRolesSectionLabels
  onManageFeatured: () => void
  onPermissionsClick: (role: ManagedRole) => void
  onUsersClick: (role: ManagedRole) => void
  onManageClick: (role: ManagedRole) => void
}

const FeaturedCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-4">
    <div className="flex items-start gap-3">
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
    <div className="mt-4 flex-1 space-y-2 rounded-lg border border-border/60 bg-background p-2.5">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
    <Skeleton className="mt-3 h-9 w-full rounded-lg" />
  </div>
)

export const FeaturedRolesSection = ({
  featuredRoles,
  isLoading = false,
  labels,
  onManageFeatured,
  onPermissionsClick,
  onUsersClick,
  onManageClick,
}: FeaturedRolesSectionProps) => (
  <section className="space-y-4">
    {!isLoading && featuredRoles.length === 0 ? (
      <div className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="size-4" strokeWidth={1.75} />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star className="size-3.5 text-primary" strokeWidth={2} />
              <h2 className="text-sm font-semibold text-foreground">{labels.title}</h2>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{labels.description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={onManageFeatured}>
          <Star className="size-3.5" />
          {labels.manageFeatured}
        </Button>
      </div>
    ) : null}

    {isLoading ? (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: MAX_FEATURED }).map((_, index) => (
          <FeaturedCardSkeleton key={index} />
        ))}
      </div>
    ) : featuredRoles.length > 0 ? (
      <>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-primary" strokeWidth={2} />
            <h2 className="text-sm font-semibold text-foreground">{labels.title}</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={onManageFeatured}>
            <Star className="size-3.5" />
            {labels.manageFeatured}
          </Button>
        </div>
        <RolesOverviewSection
          roles={featuredRoles}
          labels={{
            seeAll: labels.seeAll,
            seeAllUsers: labels.seeAllUsers,
            manage: labels.manage,
            viewPermissions: labels.viewPermissions,
            statusActive: labels.statusActive,
            statusInactive: labels.statusInactive,
            emptyMembers: labels.emptyMembers,
          }}
          onPermissionsClick={onPermissionsClick}
          onUsersClick={onUsersClick}
          onManageClick={onManageClick}
        />
      </>
    ) : (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        {labels.emptyFeatured}
      </div>
    )}
  </section>
)
