import type { ReactNode } from 'react'

import { cn } from '@/presentation/utils'

interface DataTableCellLinkProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export const DataTableCellLink = ({
  children,
  onClick,
  className,
}: DataTableCellLinkProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      '-mx-0.5 inline-flex max-w-full truncate rounded-sm px-0.5',
      'font-medium text-foreground transition-colors',
      'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      className,
    )}
  >
    {children}
  </button>
)
