import { arSA, enUS } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Language } from '@/domain/enums'
import { Calendar } from '@/presentation/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/presentation/components/ui/popover'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { useAuthStore, useLanguageStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const getFirstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName

export const DashboardWelcomeCard = () => {
  const { t } = useTranslation('dashboard')
  const language = useLanguageStore((state) => state.language)
  const user = useAuthStore((state) => state.user)
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)

  const locale = language === Language.Arabic ? arSA : enUS
  const today = useMemo(() => new Date(), [])
  const isToday = isSameDay(date, today)

  const displayName = user?.fullName ? getFirstName(user.fullName) : null
  const greeting = displayName ? t('welcome', { name: displayName }) : t('welcomeGuest')

  const formattedDate = new Intl.DateTimeFormat(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)

  const shortDate = new Intl.DateTimeFormat(language, {
    month: 'short',
    day: 'numeric',
  }).format(date)

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: CARD_EASE }}
      className={cn(
        'relative',
      )}
    >
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            <span>{greeting}</span>
            <motion.span
              aria-hidden
              animate={{ rotate: [0, 14, -8, 14, 0] }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.35 }}
              className="inline-block origin-[70%_70%] text-2xl"
            >
              👋
            </motion.span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            {t('welcomeSubtitle')}
          </p>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={t('pickDate')}
              className={cn(
                'group relative flex shrink-0 items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-4 py-3',
                'backdrop-blur-sm transition-all duration-300',
                'hover:border-border hover:bg-background',
                'focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                <CalendarDays className="size-4" strokeWidth={1.75} />
              </span>

              <span className="min-w-0 text-start">
                <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {isToday ? t('today') : shortDate}
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  {formattedDate}
                </span>
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selected) => {
                if (!selected) return
                setDate(selected)
                setOpen(false)
              }}
              locale={locale}
            />
          </PopoverContent>
        </Popover>
      </div>
    </motion.section>
  )
}
