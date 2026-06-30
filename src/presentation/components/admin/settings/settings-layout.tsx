import { motion } from 'framer-motion'
import { Bell, Eye, Globe, Lock, SlidersHorizontal } from 'lucide-react'
import { memo } from 'react'

import type { SettingsTab } from '@/domain/types'
import { cn } from '@/presentation/utils'

interface SettingsLayoutProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
  children: React.ReactNode
}

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Eye },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
]

export const SettingsLayout = memo(
  ({ activeTab, onTabChange, children }: SettingsLayoutProps) => (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav className="shrink-0 lg:w-56" aria-label="Settings navigation">
        <div className="sticky top-6 space-y-1 rounded-xl border border-border/60 bg-card p-2 lg:p-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="settings-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/8 dark:bg-primary/12"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Icon className="relative size-4" />
                <span className="relative">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  ),
)

SettingsLayout.displayName = 'SettingsLayout'
