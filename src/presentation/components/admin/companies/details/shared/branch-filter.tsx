import { Check, ChevronDown } from 'lucide-react'

import type { CompanyDetailsBranch } from '@/domain/entities/company-details.entity'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { useTranslation } from '@/presentation/hooks/use-translation'

interface BranchFilterProps {
  branches: CompanyDetailsBranch[]
  value: string
  onChange: (branchSlug: string) => void
}

export const BranchFilter = ({ branches, value, onChange }: BranchFilterProps) => {
  const { t } = useTranslation('companies')

  const activeLabel =
    value === 'all'
      ? t('detailsFilterAllBranches')
      : branches.find((b) => b.slug === value)?.name ?? t('detailsFilterAllBranches')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-w-36 justify-between gap-2">
          <span className="text-muted-foreground">{t('detailsFilterBranch')}</span>
          <span className="flex max-w-32 items-center gap-1 truncate font-medium">
            <span className="truncate">{activeLabel}</span>
            <ChevronDown className="size-4 shrink-0 opacity-60" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-64 w-56 overflow-y-auto">
        <DropdownMenuItem onClick={() => onChange('all')}>
          {t('detailsFilterAllBranches')}
          {value === 'all' && <Check className="ms-auto size-4" />}
        </DropdownMenuItem>
        {branches.map((branch) => (
          <DropdownMenuItem key={branch.id} onClick={() => onChange(branch.slug)}>
            {branch.name}
            {value === branch.slug && <Check className="ms-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
