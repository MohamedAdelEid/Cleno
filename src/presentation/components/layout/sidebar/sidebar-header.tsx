import { motion, AnimatePresence } from 'framer-motion'
import { SidebarToggleIcon } from '@/presentation/assets/icons/SidebarToggle'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { logoVariants, SIDEBAR_DURATION, SIDEBAR_EASE } from './animations'

interface SidebarHeaderProps {
  isCollapsed: boolean
  onToggle: () => void
}

export const SidebarHeader = ({ isCollapsed, onToggle }: SidebarHeaderProps) => {
  const { t } = useTranslation('common')

  return (
    <div
      className={cn(
        'flex h-[4.5rem] items-center border-b border-dashed border-sidebar-border',
        isCollapsed ? 'justify-center px-3' : 'justify-between px-1',
      )}
    >
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex min-w-0 items-center gap-3"
          >
            <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl" />
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="text-sm font-bold">C</span>
            </div>
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {t('appName')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'rounded-lg text-gray-400 transition-colors',
          'hover:text-gray-500 dark:hover:text-gray-300',
          'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
        )}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }}
        >
          <SidebarToggleIcon className="sm:size-6 size-5" />
        </motion.div>
      </button>
    </div>
  )
}
