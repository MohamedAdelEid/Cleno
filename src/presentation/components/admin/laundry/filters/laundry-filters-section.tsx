import { motion } from 'framer-motion'
import { LayoutGrid, List } from 'lucide-react'
import type { RefObject } from 'react'

import { SearchInput } from '@/presentation/components/ui/search-input'
import { SearchableSelect, type SearchableSelectOption } from '@/presentation/components/ui/searchable-select'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

export type LaundryViewMode = 'list' | 'board'
export type LaundrySortMode = 'newest' | 'oldest'

interface LaundryFiltersSectionProps {
  search: string
  onSearchChange: (value: string) => void
  customerFilter: string
  onCustomerFilterChange: (value: string) => void
  customerOptions: SearchableSelectOption[]
  sortMode: LaundrySortMode
  onSortChange: (mode: LaundrySortMode) => void
  viewMode: LaundryViewMode
  onViewModeChange: (mode: LaundryViewMode) => void
  searchInputRef?: RefObject<HTMLInputElement | null>
}

export const LaundryFiltersSection = ({
  search,
  onSearchChange,
  customerFilter,
  onCustomerFilterChange,
  customerOptions,
  sortMode,
  onSortChange,
  viewMode,
  onViewModeChange,
  searchInputRef,
}: LaundryFiltersSectionProps) => {
  const { t } = useTranslation('laundry')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.32 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchInput
          ref={searchInputRef}
          value={search}
          onValueChange={onSearchChange}
          placeholder={t('searchPlaceholder')}
          containerClassName="sm:w-64"
          className="h-10 rounded-xl"
        />

        <SearchableSelect
          value={customerFilter}
          onChange={onCustomerFilterChange}
          options={customerOptions}
          placeholder={t('filterAllCustomers')}
          searchPlaceholder={t('filterCustomer')}
          className="h-10 min-h-10 rounded-xl py-0 sm:w-52"
        />

        <div className="flex h-10 shrink-0 items-center rounded-xl border border-border/70 bg-background p-0.5">
          <button
            type="button"
            onClick={() => onSortChange('newest')}
            className={cn(
              'flex h-full items-center rounded-lg px-3 text-xs font-medium transition-all',
              sortMode === 'newest'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('sortNewest')}
          </button>
          <button
            type="button"
            onClick={() => onSortChange('oldest')}
            className={cn(
              'flex h-full items-center rounded-lg px-3 text-xs font-medium transition-all',
              sortMode === 'oldest'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('sortOldest')}
          </button>
        </div>
      </div>

      <ViewSwitcher viewMode={viewMode} onViewModeChange={onViewModeChange} />
    </motion.div>
  )
}

interface ViewSwitcherProps {
  viewMode: LaundryViewMode
  onViewModeChange: (mode: LaundryViewMode) => void
}

const VIEW_SWITCHER_SPRING = { type: 'spring', stiffness: 500, damping: 35 } as const

const ViewSwitcher = ({ viewMode, onViewModeChange }: ViewSwitcherProps) => {
  const { t } = useTranslation('laundry')

  const modes = [
    { id: 'list' as const, icon: List, label: t('viewList') },
    { id: 'board' as const, icon: LayoutGrid, label: t('viewBoard') },
  ]

  return (
    <div className="grid grid-cols-2 rounded-xl border border-border/70 bg-muted/30 p-0.5">
      {modes.map(({ id, icon: Icon, label }) => {
        const isActive = viewMode === id

        return (
          <button
            key={id}
            type="button"
            onClick={() => onViewModeChange(id)}
            className={cn(
              'relative flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors',
              isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="laundry-view-switcher-pill"
                className="absolute inset-0 rounded-lg bg-background shadow-sm"
                transition={VIEW_SWITCHER_SPRING}
              />
            )}
            <Icon className="relative z-10 size-3.5 shrink-0" strokeWidth={2} />
            <span className="relative z-10">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
