import type { ReactNode } from 'react'

import { cn } from '@/presentation/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'panel'
}

export const FormSection = ({
  title,
  description,
  children,
  className,
  variant = 'default',
}: FormSectionProps) => {
  if (variant === 'panel') {
    return (
      <section
        className={cn(
          'overflow-hidden rounded-xl border border-border/80 bg-[#f6f6f6] dark:bg-[#1a1a1a]',
          className,
        )}
      >
        <header className="space-y-1 px-5 pt-5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </header>

        <div className="mx-2 mb-2 mt-4 rounded-lg border border-border/60 bg-background p-5 sm:p-6">
          {children}
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn('rounded-xl border border-border/80 bg-card p-5 shadow-xs sm:p-6', className)}
    >
      <header className="mb-5 space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  )
}
