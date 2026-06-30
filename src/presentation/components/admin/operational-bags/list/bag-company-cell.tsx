import type { OperationalBagCompany } from '@/domain/entities'
import { DataTableCellLink } from '@/presentation/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'

interface BagCompanyCellProps {
  company: OperationalBagCompany
  onClick?: () => void
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const BagCompanyCell = ({ company, onClick }: BagCompanyCellProps) => (
  <div className="flex min-w-[200px] items-center gap-2.5">
    <Avatar className="size-8 shrink-0">
      <AvatarImage src={company.photo ?? undefined} alt={company.name} />
      <AvatarFallback className="bg-neutral-200 text-[10px] text-neutral-600 dark:bg-muted dark:text-muted-foreground">
        {getInitials(company.name)}
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0 flex-1">
      <DataTableCellLink className="text-sm font-medium" onClick={onClick}>
        {company.name}
      </DataTableCellLink>
      {company.email ? (
        <p className="truncate text-xs text-muted-foreground">{company.email}</p>
      ) : null}
    </div>
  </div>
)
