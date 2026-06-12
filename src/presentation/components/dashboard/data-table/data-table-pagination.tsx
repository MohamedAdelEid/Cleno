import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

import { useDirection } from '@/presentation/hooks/use-direction'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { cn } from '@/presentation/utils'

const PAGE_EASE = [0.25, 0.1, 0.25, 1] as const

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const

export interface DataTablePaginationLabels {
  showing: string
  rowsPerPage: string
  previous: string
  next: string
}

export interface DataTablePaginationProps {
  pageIndex: number
  pageSize: number
  totalRows: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
  labels: DataTablePaginationLabels
  className?: string
}

const getVisiblePages = (current: number, total: number): Array<number | 'ellipsis'> => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index)
  }

  const pages: Array<number | 'ellipsis'> = [0]

  if (current > 2) pages.push('ellipsis')

  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (current < total - 3) pages.push('ellipsis')

  pages.push(total - 1)

  return pages
}

export const DataTablePagination = ({
  pageIndex,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  labels,
  className,
}: DataTablePaginationProps) => {
  const { isRtl } = useDirection()
  const PreviousIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalRows)
  const visiblePages = useMemo(
    () => getVisiblePages(pageIndex, totalPages),
    [pageIndex, totalPages],
  )

  const showingLabel = labels.showing
    .replace('{{from}}', String(from))
    .replace('{{to}}', String(to))
    .replace('{{total}}', String(totalRows))

  return (
    <motion.div
      layout
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">{showingLabel}</p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <span className="text-muted-foreground">{labels.rowsPerPage}</span>
              <span className="font-medium">{pageSize}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onPageSizeChange(size)}
                className={cn(pageSize === size && 'font-medium text-primary')}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex <= 0}
            aria-label={labels.previous}
          >
            <PreviousIcon className="size-4" />
          </Button>

          <AnimatePresence mode="popLayout">
            {visiblePages.map((page, index) =>
              page === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1 text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <motion.div
                  key={page}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.18, ease: PAGE_EASE }}
                >
                  <Button
                    variant={pageIndex === page ? 'default' : 'outline'}
                    size="sm"
                    className="size-8 min-w-8 px-0"
                    onClick={() => onPageChange(page)}
                  >
                    {page + 1}
                  </Button>
                </motion.div>
              ),
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
            aria-label={labels.next}
          >
            <NextIcon className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
