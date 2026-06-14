import type { ManagedCompany } from '@/domain/entities'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'

interface CompanyCellProps {
  company: ManagedCompany
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const CompanyCell = ({ company }: CompanyCellProps) => (
  <div className="flex min-w-[220px] items-center gap-3">
    <Avatar className="size-11">
      <AvatarImage src={company.logoUrl ?? undefined} alt={company.name} />
      <AvatarFallback className="bg-neutral-200 text-xs text-neutral-600 dark:bg-muted dark:text-muted-foreground">
        {getInitials(company.name)}
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0 space-y-0.5">
      <p className="truncate text-sm font-medium text-foreground">{company.name}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground">
          {company.type}
        </Badge>
        <span className="truncate text-xs text-muted-foreground">{company.email}</span>
      </div>
    </div>
  </div>
)
