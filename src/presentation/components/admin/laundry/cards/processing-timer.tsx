import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/presentation/utils'

interface ProcessingTimerProps {
  since: string
  label: string
  className?: string
}

const formatElapsed = (since: string): string => {
  const diff = Date.now() - new Date(since).getTime()
  const totalMinutes = Math.max(0, Math.floor(diff / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

export const ProcessingTimer = ({ since, label, className }: ProcessingTimerProps) => {
  const [elapsed, setElapsed] = useState(() => formatElapsed(since))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(formatElapsed(since))
    }, 60000)

    return () => window.clearInterval(interval)
  }, [since])

  return (
    <div className={cn('flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 dark:bg-violet-950/30', className)}>
      <Clock className="size-3.5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
      <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
        {label} {elapsed}
      </span>
    </div>
  )
}
