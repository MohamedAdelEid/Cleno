import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useDirection } from '@/presentation/hooks/use-direction'
import { cn } from '@/presentation/utils'

interface PanelCardActionLinkProps {
  to: string
  label: string
  className?: string
}

export const PanelCardActionLink = ({ to, label, className }: PanelCardActionLinkProps) => {
  const { isRtl } = useDirection()

  return (
    <Link
      to={to}
      className={cn(
        'group/link inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground',
        'transition-colors duration-200 hover:text-foreground',
        className,
      )}
    >
      <span>{label}</span>
      <ArrowRight
        className={cn(
          'size-3.5 transition-transform duration-300 ease-out',
          isRtl
            ? 'rotate-180 group-hover/link:-translate-x-1'
            : 'group-hover/link:translate-x-1',
        )}
        strokeWidth={2}
      />
    </Link>
  )
}
