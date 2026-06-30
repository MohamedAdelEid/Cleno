import { motion } from 'framer-motion'
import { AlertTriangle, Bell, ChevronRight, Edit, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { CompanyAlert, CompanyDetailsData } from '@/domain/entities/company-details.entity'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, PAGE_EASE } from '@/presentation/utils'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { Popover, PopoverContent, PopoverTrigger } from '@/presentation/components/ui/popover'

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

interface CompanyDetailsHeaderProps {
  company: CompanyDetailsData
  onToggleActive: () => void
}

export const CompanyDetailsHeader = ({ company, onToggleActive }: CompanyDetailsHeaderProps) => {
  const { t } = useTranslation('companies')

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: PAGE_EASE }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 border-2 border-border/60">
            <AvatarImage src={company.logoUrl ?? undefined} alt={company.name} />
            <AvatarFallback className="bg-neutral-200 text-lg font-semibold text-neutral-600 dark:bg-muted dark:text-muted-foreground">
              {getInitials(company.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{company.name}</h1>
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground"
              >
                {company.type}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onToggleActive}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
                  company.isActive
                    ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60'
                    : 'border-red-200/80 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60',
                )}
              >
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    company.isActive ? 'bg-emerald-500' : 'bg-red-500',
                  )}
                />
                {company.isActive ? t('detailsActive') : t('detailsInactive')}
              </button>

              {company.alerts.length > 0 && (
                <AlertsPopover alerts={company.alerts} label={t('detailsAlerts')} />
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.COMPANIES.EDIT.replace(':companyId', company.slug)}>
              <Edit className="size-3.5" />
              {t('detailsEditCompany')}
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  )
}

interface AlertsPopoverProps {
  alerts: CompanyAlert[]
  label: string
}

const AlertsPopover = ({ alerts, label }: AlertsPopoverProps) => {
  const totalCount = alerts.reduce((sum, a) => sum + a.count, 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60 cursor-pointer"
        >
          <Bell className="size-3" strokeWidth={2.5} />
          {totalCount} {label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="space-y-0.5 p-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 rounded-lg px-3 py-2.5',
                alert.severity === 'warning'
                  ? 'bg-amber-50/60 dark:bg-amber-950/20'
                  : 'bg-sky-50/60 dark:bg-sky-950/20',
              )}
            >
              <span className="mt-0.5 shrink-0">
                {alert.severity === 'warning' ? (
                  <AlertTriangle
                    className="size-4 text-amber-600 dark:text-amber-400"
                    strokeWidth={2}
                  />
                ) : (
                  <Info className="size-4 text-sky-600 dark:text-sky-400" strokeWidth={2} />
                )}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </div>
              <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
