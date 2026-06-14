import type { ManagedRole } from '@/domain/entities'
import { RoleOverviewCard } from './role-overview-card'

interface RolesOverviewSectionLabels {
  seeAll: string
  seeAllUsers: string
  manage: string
  viewPermissions: string
  statusActive: string
  statusInactive: string
  emptyMembers: string
}

interface RolesOverviewSectionProps {
  roles: ManagedRole[]
  labels: RolesOverviewSectionLabels
  onPermissionsClick: (role: ManagedRole) => void
  onUsersClick: (role: ManagedRole) => void
  onManageClick: (role: ManagedRole) => void
}

export const RolesOverviewSection = ({
  roles,
  labels,
  onPermissionsClick,
  onUsersClick,
  onManageClick,
}: RolesOverviewSectionProps) => (
  <section className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {roles.map((role, index) => (
      <RoleOverviewCard
        key={role.id}
        role={role}
        index={index}
        labels={labels}
        onPermissionsClick={onPermissionsClick}
        onUsersClick={onUsersClick}
        onManageClick={onManageClick}
      />
    ))}
  </section>
)
