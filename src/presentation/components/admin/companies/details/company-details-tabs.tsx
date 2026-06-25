import { motion } from 'framer-motion'

import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

export type CompanyDetailsTab = 'overview' | 'orders' | 'invoices' | 'branches' | 'activity'

interface CompanyDetailsTabsProps {
  activeTab: CompanyDetailsTab
  onTabChange: (tab: CompanyDetailsTab) => void
}

const TAB_SPRING = { type: 'spring', stiffness: 500, damping: 35 } as const

const tabs: { id: CompanyDetailsTab; labelKey: string }[] = [
  { id: 'overview', labelKey: 'detailsTabOverview' },
  { id: 'orders', labelKey: 'detailsTabOrders' },
  { id: 'invoices', labelKey: 'detailsTabInvoices' },
  { id: 'branches', labelKey: 'detailsTabBranches' },
  { id: 'activity', labelKey: 'detailsTabActivity' },
]

export const CompanyDetailsTabs = ({ activeTab, onTabChange }: CompanyDetailsTabsProps) => {
  const { t } = useTranslation('companies')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      className="border-b border-border/70"
    >
      <div className="-mb-px flex gap-0 overflow-x-auto">
        {tabs.map(({ id, labelKey }) => {
          const isActive = activeTab === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                'relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="company-details-tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground"
                  transition={TAB_SPRING}
                />
              )}
              {t(labelKey)}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
