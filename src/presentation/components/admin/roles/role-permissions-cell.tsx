import { Shield } from 'lucide-react'

import { cn } from '@/presentation/utils'

interface RolePermissionsCellProps {
  count: number
  label: string
  onClick?: () => void
}

export const RolePermissionsCell = ({ count, label, onClick }: RolePermissionsCellProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border border-border/80 px-2.5 py-1',
      'text-xs font-medium text-foreground transition-all duration-200',
      'hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
    )}
  >
    <Shield className="size-3.5 opacity-70" strokeWidth={2} />
    <span>{count}</span>
    <span className="text-muted-foreground">{label}</span>
  </button>
)
