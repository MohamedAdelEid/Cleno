import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { resolveTheme, type ResolvedTheme } from '@/infrastructure/libs/theme/theme'
import { cn } from '@/presentation/utils'
import { useThemeStore } from '@/presentation/store'

export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme)
  const toggle = useThemeStore((state) => state.toggle)
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(theme))

  useEffect(() => {
    setResolved(resolveTheme(theme))
  }, [theme])

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      )}
    >
      {resolved === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
