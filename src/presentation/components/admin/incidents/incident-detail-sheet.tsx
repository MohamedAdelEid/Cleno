import { format, parseISO } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, ExternalLink, MessageSquare, Pencil, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ManagedIncident, ManagedIncidentDetail } from '@/domain/entities'
import { Language } from '@/domain/enums'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Textarea } from '@/presentation/components/ui/input'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/presentation/components/ui/sheet'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { useLanguageStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'

import { IncidentStatusBadge } from './incident-status-badge'

const SHEET_EASE = [0.32, 0.72, 0, 1] as const
const CONTENT_EASE = [0.25, 0.1, 0.25, 1] as const

interface IncidentDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incidentSlug: string | null
  incidentPreview?: ManagedIncident | null
  onLoad: (slug: string) => Promise<ManagedIncidentDetail | null>
  onAddReply: (slug: string, message: string) => Promise<{ success: boolean; error?: string }>
  onUpdateReply: (
    slug: string,
    replyId: string,
    message: string,
  ) => Promise<{ success: boolean; error?: string }>
  onDeleteReply: (slug: string, replyId: string) => Promise<{ success: boolean; error?: string }>
}

const formatDate = (value: string, locale: typeof enUS) => {
  try {
    return format(parseISO(value), 'MMM d, yyyy · h:mm a', { locale })
  } catch {
    return value
  }
}

const MetaLink = ({
  label,
  value,
  onClick,
}: {
  label: string
  value: string
  onClick?: () => void
}) => (
  <div className="flex items-start justify-between gap-3">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    {onClick ? (
      <button
        type="button"
        onClick={onClick}
        className="group inline-flex max-w-[65%] items-center gap-1.5 text-end font-medium text-foreground transition-colors hover:text-primary"
      >
        <span className="truncate">{value}</span>
        <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-70" />
      </button>
    ) : (
      <span className="max-w-[65%] truncate text-end font-medium">{value}</span>
    )}
  </div>
)

export const IncidentDetailSheet = ({
  open,
  onOpenChange,
  incidentSlug,
  incidentPreview,
  onLoad,
  onAddReply,
  onUpdateReply,
  onDeleteReply,
}: IncidentDetailSheetProps) => {
  const { t } = useTranslation('incidents')
  const navigate = useNavigate()
  const language = useLanguageStore((state) => state.language)
  const locale = language === Language.Arabic ? arSA : enUS

  const [detail, setDetail] = useState<ManagedIncidentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState('')
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !incidentSlug) {
      setDetail(null)
      return
    }

    setIsLoading(true)
    void onLoad(incidentSlug).then((data) => {
      setDetail(data)
      setIsLoading(false)
    })
  }, [incidentSlug, onLoad, open])

  useEffect(() => {
    if (!open) {
      setReply('')
      setEditingReplyId(null)
      setEditingMessage('')
    }
  }, [open])

  const reload = async () => {
    if (!incidentSlug) return
    const data = await onLoad(incidentSlug)
    setDetail(data)
  }

  const handleAddReply = async () => {
    if (!incidentSlug || !reply.trim()) return

    setIsSubmitting(true)
    const result = await onAddReply(incidentSlug, reply.trim())
    setIsSubmitting(false)

    if (result.success) {
      setReply('')
      await reload()
    }
  }

  const handleSaveReply = async () => {
    if (!incidentSlug || !editingReplyId || !editingMessage.trim()) return

    setIsSubmitting(true)
    const result = await onUpdateReply(incidentSlug, editingReplyId, editingMessage.trim())
    setIsSubmitting(false)

    if (result.success) {
      setEditingReplyId(null)
      setEditingMessage('')
      await reload()
    }
  }

  const handleDeleteReply = async () => {
    if (!incidentSlug || !deleteReplyId) return

    setIsSubmitting(true)
    const result = await onDeleteReply(incidentSlug, deleteReplyId)
    setIsSubmitting(false)
    setDeleteReplyId(null)

    if (result.success) {
      await reload()
    }
  }

  const goToOrder = () => {
    const orderNumber = detail?.order.number || incidentPreview?.order.number
    if (!orderNumber) return
    onOpenChange(false)
    navigate(ROUTES.ORDERS.withSearch(orderNumber))
  }

  const goToCompany = () => {
    const slug = detail?.company.slug || incidentPreview?.company.slug
    if (!slug) return
    onOpenChange(false)
    navigate(ROUTES.COMPANIES.details(slug))
  }

  const goToBranch = () => {
    const companySlug = detail?.company.slug || incidentPreview?.company.slug
    const branchSlug = detail?.branch.slug || incidentPreview?.branch.slug
    if (!companySlug || !branchSlug) return
    onOpenChange(false)
    navigate(ROUTES.COMPANIES.detailsTab(companySlug, 'branches', { branch: branchSlug }))
  }

  const companyName = detail?.company.name || incidentPreview?.company.name || ''
  const branchName = detail?.branch.name || incidentPreview?.branch.name || ''
  const orderNumber = detail?.order.number || incidentPreview?.order.number || ''
  const companySlug = detail?.company.slug || incidentPreview?.company.slug
  const branchSlug = detail?.branch.slug || incidentPreview?.branch.slug

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton
          className={cn(
            'w-full gap-0 overflow-hidden border-s border-border/70 p-0 sm:max-w-xl',
            'data-[state=open]:duration-500 data-[state=closed]:duration-350',
            'data-[state=open]:ease-[cubic-bezier(0.32,0.72,0,1)]',
          )}
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="shrink-0 border-b border-border/60 bg-muted/10 px-6 py-5 pe-14 text-start">
              {isLoading || !detail ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-56" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, ease: CONTENT_EASE }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetTitle className="text-lg">{detail.title}</SheetTitle>
                    <IncidentStatusBadge isOpen={detail.isOpen} />
                  </div>
                  <SheetDescription className="mt-1">
                    {detail.typeLabel} · {detail.stageLabel}
                  </SheetDescription>
                </motion.div>
              )}
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                {isLoading || !detail ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                  </motion.div>
                ) : (
                  <motion.div
                    key={detail.slug}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.34, ease: SHEET_EASE }}
                    className="space-y-5"
                  >
                    <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-4">
                      <p className="text-sm leading-relaxed text-foreground/90">{detail.description}</p>
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserRound className="size-3" />
                        {t('reportedBy')}: {detail.reporterName}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDate(detail.createdAt, locale)}
                      </p>
                    </div>

                    <div className="space-y-3 rounded-xl border border-border/60 bg-background px-4 py-4 text-sm shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Building2 className="size-3.5" />
                        {t('detailContext')}
                      </div>
                      <MetaLink
                        label={t('colOrder')}
                        value={orderNumber}
                        onClick={orderNumber ? goToOrder : undefined}
                      />
                      <MetaLink
                        label={t('colCompany')}
                        value={companyName}
                        onClick={companySlug ? goToCompany : undefined}
                      />
                      {branchName ? (
                        <MetaLink
                          label={t('colBranch')}
                          value={branchName}
                          onClick={branchSlug ? goToBranch : undefined}
                        />
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <MessageSquare className="size-4 text-muted-foreground" />
                        {t('replies')}
                        {detail.replies.length > 0 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {detail.replies.length}
                          </span>
                        )}
                      </h3>

                      {detail.replies.length === 0 ? (
                        <p className="text-xs text-muted-foreground">{t('noReplies')}</p>
                      ) : (
                        <div className="space-y-2.5">
                          {detail.replies.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.04, duration: 0.24 }}
                              className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3.5"
                            >
                              {editingReplyId === item.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editingMessage}
                                    onChange={(event) => setEditingMessage(event.target.value)}
                                    rows={3}
                                    className="resize-none"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingReplyId(null)}
                                    >
                                      {t('cancel')}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => void handleSaveReply()}
                                      disabled={isSubmitting}
                                    >
                                      {t('saveChanges')}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm leading-relaxed">{item.message}</p>
                                  <div className="mt-2.5 flex items-center justify-between gap-2">
                                    <p className="text-[10px] text-muted-foreground">
                                      {item.authorName} · {formatDate(item.createdAt, locale)}
                                    </p>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setEditingReplyId(item.id)
                                          setEditingMessage(item.message)
                                        }}
                                      >
                                        <Pencil className="size-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setDeleteReplyId(item.id)}
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {detail.isOpen ? (
                      <div className="space-y-2 border-t border-border/50 pt-4">
                        <Textarea
                          value={reply}
                          onChange={(event) => setReply(event.target.value)}
                          placeholder={t('replyPlaceholder')}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => void handleAddReply()}
                            disabled={!reply.trim() || isSubmitting}
                          >
                            {t('sendReply')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={cn(
                          'rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-800',
                          'dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-300',
                        )}
                      >
                        {t('closedHint')}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AppDialog
        open={deleteReplyId != null}
        onOpenChange={(next) => !next && setDeleteReplyId(null)}
        title={t('deleteReplyTitle')}
        description={t('deleteReplyDesc')}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteReplyId(null)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={() => void handleDeleteReply()} disabled={isSubmitting}>
              {t('delete')}
            </Button>
          </>
        }
      />
    </>
  )
}
