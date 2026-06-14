import type { RoleMember } from '@/domain/entities'
import { RoleStatus } from '@/domain/enums'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { RoleStatusBadge } from './role-status-badge'

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

interface RoleMemberRowLabels {
  statusActive: string
  statusInactive: string
}

interface RoleMemberRowProps {
  member: RoleMember
  labels: RoleMemberRowLabels
}

export const RoleMemberRow = ({ member, labels }: RoleMemberRowProps) => (
  <div className="flex items-center gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-muted/40">
    <Avatar size="sm">
      <AvatarImage src={member.avatarUrl ?? undefined} alt={member.fullName} />
      <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
        {getInitials(member.fullName)}
      </AvatarFallback>
    </Avatar>

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-foreground">{member.fullName}</p>
      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
    </div>

    <RoleStatusBadge
      status={member.status}
      label={member.status === RoleStatus.Active ? labels.statusActive : labels.statusInactive}
    />
  </div>
)
