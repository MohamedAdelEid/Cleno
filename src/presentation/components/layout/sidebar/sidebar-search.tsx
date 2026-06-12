import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import { SearchIcon, type SearchIconHandle } from '@/presentation/assets/icons/Search'
import { SearchInput } from '@/presentation/components/ui/search-input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { SIDEBAR_DURATION, SIDEBAR_EASE } from './animations'

interface SidebarSearchProps {
  isCollapsed: boolean
}

export const SidebarSearch = ({ isCollapsed }: SidebarSearchProps) => {
  const { t } = useTranslation('common')
  const { isRtl } = useDirection()
  const inputRef = useRef<HTMLInputElement>(null)
  const iconRef = useRef<SearchIconHandle>(null)

  const focusSearch = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        focusSearch()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusSearch])

  const handleMouseEnter = () => iconRef.current?.startAnimation()
  const handleMouseLeave = () => iconRef.current?.stopAnimation()

  if (isCollapsed) {
    return (
      <div className="flex justify-center pt-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={t('searchPlaceholder')}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'flex size-10 items-center justify-center rounded-xl border border-sidebar-border/80',
                'text-muted-foreground transition-all duration-300',
                'hover:border-sidebar-border hover:text-sidebar-foreground',
                'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
              )}
            >
              <SearchIcon ref={iconRef} size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side={isRtl ? 'left' : 'right'} sideOffset={8}>
            {t('searchPlaceholder')}
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }}
      className="pt-4"
    >
      <SearchInput
        ref={inputRef}
        placeholder={t('searchPlaceholder')}
        variant="sidebar"
        showShortcut
        aria-label={t('searchPlaceholder')}
      />
    </motion.div>
  )
}
