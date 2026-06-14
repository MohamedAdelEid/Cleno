import { BarChart3, LineChart } from 'lucide-react'

import { cn } from '@/presentation/utils'

export type OrderAnalysisMode = 'line' | 'bar'

interface OrderAnalysisToggleProps {
  value: OrderAnalysisMode
  onChange: (mode: OrderAnalysisMode) => void
  labels: { line: string; bar: string }
  className?: string
}

const OPTIONS: { mode: OrderAnalysisMode; icon: typeof LineChart }[] = [
  { mode: 'line', icon: LineChart },
  { mode: 'bar', icon: BarChart3 },
]

export const OrderAnalysisToggle = ({
  value,
  onChange,
  labels,
  className,
}: OrderAnalysisToggleProps) => (
  <div
    className={cn(
      'inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background p-0.5',
      className,
    )}
  >
    {OPTIONS.map(({ mode, icon: Icon }) => {
      const isActive = value === mode

      return (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          aria-pressed={isActive}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            isActive
              ? 'bg-muted text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-3.5" strokeWidth={2} />
          {mode === 'line' ? labels.line : labels.bar}
        </button>
      )
    })}
  </div>
)
