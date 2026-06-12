import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/presentation/components/ui/breadcrumb'
import { useBreadcrumbs } from '@/presentation/hooks/use-breadcrumbs'
import { cn } from '@/presentation/utils'

const BREADCRUMB_EASE = [0.25, 0.1, 0.25, 1] as const

const crumbVariants = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const separatorVariants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
}

interface CrumbContentProps {
  label: string
  href?: string
  icon?: LucideIcon
  isCurrent?: boolean
}

const CrumbContent = ({ label, href, icon: Icon, isCurrent }: CrumbContentProps) => {
  if (isCurrent) {
    return <BreadcrumbPage>{label}</BreadcrumbPage>
  }

  const content = (
    <span className="inline-flex items-center gap-2">
      {Icon && <Icon className="size-4 shrink-0 text-muted-foreground/80" strokeWidth={1.75} />}
      <span>{label}</span>
    </span>
  )

  if (href) {
    return (
      <BreadcrumbLink asChild>
        <Link to={href} className="text-muted-foreground">
          {content}
        </Link>
      </BreadcrumbLink>
    )
  }

  return <span className="text-muted-foreground">{content}</span>
}

export const DashboardBreadcrumb = ({ className }: { className?: string }) => {
  const { pathname } = useLocation()
  const breadcrumbs = useBreadcrumbs()

  return (
    <Breadcrumb className={cn('min-w-0', className)}>
      <AnimatePresence mode="wait" initial>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.3, ease: BREADCRUMB_EASE }}
          className="min-w-0"
        >
          <BreadcrumbList>
            {breadcrumbs.flatMap((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              const isFirst = index === 0
              const nodes = []

              if (index > 0) {
                nodes.push(
                  <BreadcrumbSeparator
                    key={`${pathname}-sep-${index}`}
                    className="text-muted-foreground/50"
                  >
                    <motion.span
                      variants={separatorVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ duration: 0.22, ease: BREADCRUMB_EASE, delay: index * 0.04 }}
                      className="px-0.5 text-sm font-light select-none"
                    >
                      /
                    </motion.span>
                  </BreadcrumbSeparator>,
                )
              }

              nodes.push(
                <BreadcrumbItem key={`${pathname}-crumb-${index}`}>
                  <motion.div
                    variants={crumbVariants}
                    initial="initial"
                    animate="animate"
                    transition={{
                      duration: 0.28,
                      ease: BREADCRUMB_EASE,
                      delay: index * 0.06,
                    }}
                  >
                    <CrumbContent
                      label={crumb.label}
                      href={crumb.href}
                      icon={isFirst ? crumb.icon : undefined}
                      isCurrent={isLast}
                    />
                  </motion.div>
                </BreadcrumbItem>,
              )

              return nodes
            })}
          </BreadcrumbList>
        </motion.div>
      </AnimatePresence>
    </Breadcrumb>
  )
}
