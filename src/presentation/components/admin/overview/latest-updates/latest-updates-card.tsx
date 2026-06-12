import { arSA, enUS } from 'date-fns/locale'
import {
  endOfWeek,
  isSameDay,
  isWithinInterval,
  startOfWeek,
  subDays,
} from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, List, MoreHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Language } from '@/domain/enums'
import { Calendar } from '@/presentation/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/presentation/components/ui/popover'
import { SearchInput } from '@/presentation/components/ui/search-input'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { useLanguageStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'
import { ActivityTimelineItem } from './activity-timeline-item'
import { ActivityTimelineSkeleton } from './activity-timeline-skeleton'
import { ScrollHint } from './scroll-hint'
import { latestUpdatesDummyData } from './latest-updates.data'
import type { ActivityItem, UpdatesFilter } from './latest-updates.types'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

const FILTER_BTN =
  'flex-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-all duration-300'

const filterButtonClass = (active: boolean) =>
  cn(
    FILTER_BTN,
    active
      ? 'border-transparent bg-gradient-to-b from-slate-700 to-slate-900 text-white shadow-sm dark:from-slate-600 dark:to-slate-950'
      : 'border-border/80 bg-background text-muted-foreground hover:border-border hover:text-foreground',
  )

const matchesFilter = (
  item: ActivityItem,
  filter: UpdatesFilter,
  customDate: Date | undefined,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): boolean => {
  const now = new Date()

  switch (filter) {
    case 'today':
      return isSameDay(item.occurredAt, now)
    case 'yesterday':
      return isSameDay(item.occurredAt, subDays(now, 1))
    case 'this-week':
      return isWithinInterval(item.occurredAt, {
        start: startOfWeek(now, { weekStartsOn }),
        end: endOfWeek(now, { weekStartsOn }),
      })
    case 'custom':
      return customDate ? isSameDay(item.occurredAt, customDate) : false
    default:
      return true
  }
}

interface LatestUpdatesCardProps {
  index?: number
  className?: string
}

export const LatestUpdatesCard = ({ index = 3, className }: LatestUpdatesCardProps) => {
  const { t } = useTranslation('dashboard')
  const language = useLanguageStore((state) => state.language)
  const locale = language === Language.Arabic ? arSA : enUS
  const weekStartsOn = language === Language.Arabic ? 6 : 1

  const [filter, setFilter] = useState<UpdatesFilter>('today')
  const [customDate, setCustomDate] = useState<Date | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [canScroll, setCanScroll] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const hasOverflow = el.scrollHeight > el.clientHeight + 4
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 12
    setCanScroll(hasOverflow && !nearBottom)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const timer = window.setTimeout(() => setIsLoading(false), 480)
    return () => window.clearTimeout(timer)
  }, [filter, customDate, searchQuery])

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return latestUpdatesDummyData.filter((item) => {
      const matchesDate = matchesFilter(item, filter, customDate, weekStartsOn)
      if (!matchesDate) return false
      if (!query) return true

      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    })
  }, [filter, customDate, searchQuery, weekStartsOn])

  useEffect(() => {
    if (isLoading) return
    checkScroll()
    const el = scrollRef.current
    if (!el) return

    const observer = new ResizeObserver(checkScroll)
    observer.observe(el)
    return () => observer.disconnect()
  }, [isLoading, filteredItems.length, checkScroll])

  const summaryLabel = useMemo(() => {
    if (filter === 'custom' && customDate) {
      const formatted = new Intl.DateTimeFormat(language, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(customDate)

      return t('updatesActivitiesCustom', { date: formatted })
    }

    if (filter === 'yesterday') return t('updatesActivitiesYesterday')
    if (filter === 'this-week') return t('updatesActivitiesWeek')
    return t('updatesActivitiesToday')
  }, [filter, customDate, language, t])

  const formattedCustomDate = customDate
    ? new Intl.DateTimeFormat(language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(customDate)
    : null

  const handleFilterChange = (next: UpdatesFilter) => {
    setFilter(next)
    if (next !== 'custom') setCustomDate(undefined)
  }

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return
    setCustomDate(date)
    setFilter('custom')
    setCalendarOpen(false)
  }

  const clearCustomDate = () => {
    setCustomDate(undefined)
    setFilter('today')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: CARD_EASE, delay: index * 0.08 }}
      className={cn(
        'flex min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-[#f6f6f6] dark:bg-[#1a1a1a]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{t('latestUpdates')}</h3>
        <List className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
      </div>

      <div className="mx-2 mb-2 flex min-h-0 flex-1 flex-col rounded-lg border border-border/60 bg-background">
        <div className="space-y-3 p-3.5">
          <div className="flex w-full items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFilterChange('today')}
              className={filterButtonClass(filter === 'today')}
            >
              {t('filterToday')}
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('yesterday')}
              className={filterButtonClass(filter === 'yesterday')}
            >
              {t('filterYesterday')}
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('this-week')}
              className={filterButtonClass(filter === 'this-week')}
            >
              {t('filterThisWeek')}
            </button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={t('pickDate')}
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-xl border px-2 py-1.5 transition-all duration-300',
                    filter === 'custom'
                      ? 'border-transparent bg-gradient-to-b from-slate-700 to-slate-900 text-white shadow-sm dark:from-slate-600 dark:to-slate-950'
                      : 'border-border/80 bg-background text-muted-foreground hover:border-border hover:text-foreground',
                  )}
                >
                  <MoreHorizontal className="size-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={handleCustomDateSelect}
                  locale={locale}
                />
              </PopoverContent>
            </Popover>
          </div>

          <AnimatePresence initial={false}>
            {filter === 'custom' && formattedCustomDate && (
              <motion.div
                key="custom-date-chip"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.28, ease: CARD_EASE }}
                className="overflow-hidden"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary">
                  <CalendarDays className="size-3.5" />
                  <span className="font-medium">{formattedCustomDate}</span>
                  <button
                    type="button"
                    onClick={clearCustomDate}
                    aria-label={t('clearDate')}
                    className="rounded-full p-0.5 transition-colors hover:bg-primary/10"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder={t('searchActivities')}
          />

          <motion.p
            key={`${filter}-${customDate?.toISOString() ?? 'none'}-${searchQuery}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: CARD_EASE }}
            className="text-sm text-muted-foreground"
          >
            <span className="font-semibold text-foreground">{filteredItems.length}</span>{' '}
            {summaryLabel}
          </motion.p>
        </div>

        <div className="mx-3.5 border-t border-dashed border-border/80" />

        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className={cn(
              'max-h-[min(300px,30dvh)] overflow-y-auto px-3.5 py-2',
              'xl:max-h-[min(200px,20dvh)]',
              '2xl:max-h-[min(400px,50dvh)]',
              'xl:flex-1',
              '[scrollbar-width:thin] [scrollbar-color:hsl(0_0%_80%)_transparent]',
              '[&::-webkit-scrollbar]:w-1',
              '[&::-webkit-scrollbar-track]:bg-transparent',
              '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80',
              '[&::-webkit-scrollbar-thumb]:hover:bg-border',
            )}
          >
            {isLoading ? (
              <ActivityTimelineSkeleton />
            ) : filteredItems.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                {t('noActivities')}
              </motion.p>
            ) : (
              <ul className="relative">
                <span
                  aria-hidden
                  className="absolute start-4 top-4 bottom-4 w-px border-s border-dashed border-border/80"
                />
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredItems.map((item, itemIndex) => (
                    <ActivityTimelineItem key={item.id} item={item} index={itemIndex} />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          <AnimatePresence>
            {!isLoading && filteredItems.length > 0 && canScroll && <ScrollHint />}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
}
