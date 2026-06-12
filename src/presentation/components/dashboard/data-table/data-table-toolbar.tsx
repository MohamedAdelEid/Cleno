import type { ReactNode } from 'react'

import { SearchInput } from '@/presentation/components/ui/search-input'
import { cn } from '@/presentation/utils'

export interface DataTableToolbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  endContent?: ReactNode
  className?: string
}

export const DataTableToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder,
  endContent,
  className,
}: DataTableToolbarProps) => (
  <div
    className={cn(
      'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between',
      className,
    )}
  >
    {onSearchChange !== undefined && (
      <SearchInput
        value={search}
        onValueChange={onSearchChange}
        placeholder={searchPlaceholder}
        containerClassName="w-full lg:max-w-sm"
      />
    )}

    {endContent && (
      <div className="flex flex-wrap items-center justify-end gap-2">{endContent}</div>
    )}
  </div>
)
