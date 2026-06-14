import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { BreadcrumbEntry } from '@/presentation/hooks/use-breadcrumbs'
import { useBreadcrumbs } from '@/presentation/hooks/use-breadcrumbs'
import { useIsMobile } from '@/presentation/hooks/use-mobile'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/presentation/components/ui/breadcrumb'
import { cn } from '@/presentation/utils'

const SLIDE_EASE = [0.22, 1, 0.36, 1] as const

const layoutTransition = {
  layout: {
    type: 'spring' as const,
    stiffness: 420,
    damping: 34,
    mass: 0.75,
  },
}

const crumbMotion = {
  initial: { opacity: 0, x: 16, filter: 'blur(6px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: 12, filter: 'blur(4px)' },
  transition: {
    duration: 0.42,
    ease: SLIDE_EASE,
  },
}

const separatorMotion = {
  initial: { opacity: 0, scale: 0.82, filter: 'blur(2px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.82, filter: 'blur(2px)' },
  transition: {
    duration: 0.3,
    ease: SLIDE_EASE,
  },
}

const ellipsisMotion = {
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.88 },
  transition: {
    duration: 0.32,
    ease: SLIDE_EASE,
  },
}

interface CrumbContentProps {
  label: string
  href?: string
  icon?: LucideIcon
  isCurrent?: boolean
  compact?: boolean
}

const CrumbContent = ({ label, href, icon: Icon, isCurrent, compact }: CrumbContentProps) => {
  const content = (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', compact && 'max-w-[9.5rem]')}>
      {Icon ? (
        <Icon className="size-4 shrink-0 text-muted-foreground/80" strokeWidth={1.75} />
      ) : null}
      <span className={cn('truncate', compact && 'text-xs')}>{label}</span>
    </span>
  )

  if (isCurrent) {
    return (
      <BreadcrumbPage className={cn(compact && 'max-w-[10.5rem] truncate text-xs sm:text-sm')}>
        {content}
      </BreadcrumbPage>
    )
  }

  if (href) {
    return (
      <BreadcrumbLink asChild>
        <Link to={href} className={cn('min-w-0 text-muted-foreground', compact && 'max-w-[9.5rem]')}>
          {content}
        </Link>
      </BreadcrumbLink>
    )
  }

  return (
    <span className={cn('min-w-0 text-muted-foreground', compact && 'max-w-[9.5rem] truncate text-xs')}>
      {content}
    </span>
  )
}

type BreadcrumbSegment =
  | { type: 'crumb'; id: string; crumb: BreadcrumbEntry; isCurrent: boolean; showIcon: boolean }
  | { type: 'separator'; id: string }
  | { type: 'ellipsis'; id: string }

const buildSegments = (breadcrumbs: BreadcrumbEntry[], isMobile: boolean): BreadcrumbSegment[] => {
  const visibleCrumbs =
    isMobile && breadcrumbs.length > 2
      ? [breadcrumbs[0], breadcrumbs[breadcrumbs.length - 1]].filter(
          (crumb): crumb is BreadcrumbEntry => !!crumb,
        )
      : breadcrumbs

  const segments: BreadcrumbSegment[] = []
  const showEllipsis = isMobile && breadcrumbs.length > 2

  visibleCrumbs.forEach((crumb, index) => {
    if (showEllipsis && index === 1) {
      segments.push({ type: 'ellipsis', id: 'ellipsis' })
      segments.push({ type: 'separator', id: 'sep-ellipsis' })
    } else if (index > 0) {
      segments.push({
        type: 'separator',
        id: `sep-${visibleCrumbs[index - 1]?.id}-${crumb.id}`,
      })
    }

    segments.push({
      type: 'crumb',
      id: crumb.id,
      crumb,
      isCurrent: index === visibleCrumbs.length - 1,
      showIcon: index === 0,
    })
  })

  return segments
}

export const DashboardBreadcrumb = ({ className }: { className?: string }) => {
  const breadcrumbs = useBreadcrumbs()
  const isMobile = useIsMobile()
  const segments = buildSegments(breadcrumbs, isMobile)

  return (
    <Breadcrumb className={cn('min-w-0', className)}>
      <BreadcrumbList
        className={cn(
          'min-w-0 items-center gap-1 text-muted-foreground',
          isMobile ? 'flex-nowrap overflow-hidden' : 'flex-wrap gap-1.5 sm:gap-2',
        )}
      >
        <AnimatePresence initial={false} mode="sync">
          {segments.map((segment, index) => {
            if (segment.type === 'ellipsis') {
              return (
                <motion.li
                  key={segment.id}
                  layout
                  {...ellipsisMotion}
                  transition={{
                    ...layoutTransition,
                    ...ellipsisMotion.transition,
                    delay: index * 0.04,
                  }}
                  className="inline-flex shrink-0 items-center"
                >
                  <BreadcrumbEllipsis className="size-7" />
                </motion.li>
              )
            }

            if (segment.type === 'separator') {
              return (
                <motion.li
                  key={segment.id}
                  layout
                  {...separatorMotion}
                  transition={{
                    ...layoutTransition,
                    ...separatorMotion.transition,
                    delay: index * 0.035,
                  }}
                  role="presentation"
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center text-muted-foreground/50"
                >
                  <BreadcrumbSeparator className="gap-0">
                    <span className="px-0.5 text-xs font-light select-none sm:text-sm">/</span>
                  </BreadcrumbSeparator>
                </motion.li>
              )
            }

            return (
              <motion.li
                key={segment.id}
                layout
                {...crumbMotion}
                transition={{
                  ...layoutTransition,
                  ...crumbMotion.transition,
                  delay: index * 0.045,
                }}
                className="inline-flex min-w-0 shrink items-center"
              >
                <BreadcrumbItem className="min-w-0">
                  <CrumbContent
                    label={segment.crumb.label}
                    href={segment.crumb.href}
                    icon={segment.showIcon ? segment.crumb.icon : undefined}
                    isCurrent={segment.isCurrent}
                    compact={isMobile}
                  />
                </BreadcrumbItem>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
