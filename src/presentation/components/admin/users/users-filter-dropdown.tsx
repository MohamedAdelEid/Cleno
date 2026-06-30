import { Check, ChevronDown } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'

export interface UsersFilterOption {
  value: string
  label: string
}

interface UsersFilterDropdownProps {
  label: string
  value: string
  options: UsersFilterOption[]
  onChange: (value: string) => void
  className?: string
  contentClassName?: string
}

export const UsersFilterDropdown = ({
  label,
  value,
  options,
  onChange,
  className = 'min-w-36',
  contentClassName = 'w-48',
}: UsersFilterDropdownProps) => {
  const activeLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`h-9 justify-between gap-2 ${className}`}>
          <span className="text-muted-foreground">{label}</span>
          <span className="flex min-w-0 items-center gap-1 font-medium">
            <span className="truncate">{activeLabel}</span>
            <ChevronDown className="size-4 shrink-0 opacity-60" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName}>
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
            <span className="truncate">{option.label}</span>
            {value === option.value ? <Check className="ms-auto size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
