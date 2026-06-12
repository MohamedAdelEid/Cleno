import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/presentation/utils'

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) => {
  if (!column.getCanSort()) {
    return (
      <span className={cn('text-xs font-medium text-muted-foreground', className)}>
        {title}
      </span>
    )
  }

  const sorted = column.getIsSorted()

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className={cn(
        '-ms-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5',
        'text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
    >
      {title}
      {sorted === 'asc' ? (
        <ArrowUp className="size-3.5 text-foreground" strokeWidth={2} />
      ) : sorted === 'desc' ? (
        <ArrowDown className="size-3.5 text-foreground" strokeWidth={2} />
      ) : (
        <ChevronsUpDown className="size-3.5 opacity-45" strokeWidth={2} />
      )}
    </button>
  )
}
