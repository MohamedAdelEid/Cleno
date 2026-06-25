import { format } from 'date-fns'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import type { LaundryIncident } from '@/domain/entities/laundry-order.entity'
import { LaundryWorkflowStage } from '@/domain/enums'
import { laundryApi } from '@/infrastructure/api/laundry.api'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { Textarea } from '@/presentation/components/ui/input'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { cn } from '@/presentation/utils'

const stageLabels: Record<LaundryWorkflowStage, 'stageIncoming' | 'stageProcessing' | 'stageReady'> = {
  [LaundryWorkflowStage.IncomingToLaundry]: 'stageIncoming',
  [LaundryWorkflowStage.InLaundry]: 'stageProcessing',
  [LaundryWorkflowStage.ReadyForDelivery]: 'stageReady',
}

export const LaundryIncidentsPage = () => {
  const { orderId: orderSlug } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('laundry')

  const [orderNumber, setOrderNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [incidents, setIncidents] = useState<LaundryIncident[]>([])
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [activeIncident, setActiveIncident] = useState<LaundryIncident | null>(null)
  const [reply, setReply] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const loadIncidents = useCallback(async () => {
    if (!orderSlug) return

    setIsLoading(true)

    try {
      const result = await laundryApi.getOrderIncidents(orderSlug)

      if (!result.hasValue || !result.data) {
        setNotFound(true)
        setIncidents([])
        return
      }

      setNotFound(false)
      setOrderNumber(result.data.orderNumber)
      setCompanyName(result.data.companyName)
      setIncidents(result.data.incidents)
      setActiveSlug(
        (current) =>
          current ?? result.data!.incidents[0]?.slug ?? result.data!.incidents[0]?.id ?? null,
      )
    } catch {
      setNotFound(true)
      setIncidents([])
    } finally {
      setIsLoading(false)
    }
  }, [orderSlug])

  const loadIncidentDetail = useCallback(async (incidentSlug: string) => {
    setIsDetailLoading(true)

    try {
      const result = await laundryApi.getIncidentDetail(incidentSlug)

      if (result.hasValue && result.data) {
        setActiveIncident(result.data)
      }
    } catch {
      setActiveIncident(null)
    } finally {
      setIsDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadIncidents()
  }, [loadIncidents])

  useEffect(() => {
    if (!activeSlug) {
      setActiveIncident(null)
      return
    }

    void loadIncidentDetail(activeSlug)
  }, [activeSlug, loadIncidentDetail])

  const handleReply = async () => {
    const trimmed = reply.trim()
    if (!trimmed || !activeSlug) return

    setIsSubmitting(true)

    try {
      const result = await laundryApi.addIncidentReply(activeSlug, trimmed)

      if (!result.hasValue) return

      setReply('')
      await loadIncidentDetail(activeSlug)
      await loadIncidents()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!orderSlug || notFound) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('orderNotFound')}</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.LAUNDRY.INDEX)}>
          {t('backToLaundry')}
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  const active = activeIncident ?? incidents.find((incident) => incident.slug === activeSlug || incident.id === activeSlug)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('incidentsPageTitle')}
        description={
          orderNumber && companyName
            ? `${orderNumber} — ${companyName}`
            : orderSlug
        }
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.LAUNDRY.INDEX}>
              <ArrowLeft className="size-3.5" />
              {t('backToLaundry')}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-1.5">
          {incidents.map((incident) => (
            <button
              key={incident.id}
              type="button"
              onClick={() => setActiveSlug(incident.slug ?? incident.id)}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-start transition-colors',
                active?.id === incident.id
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border/60 hover:bg-muted/30',
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {incident.type}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-foreground">{incident.content}</p>
            </button>
          ))}
        </aside>

        {active && (
          <article className="rounded-xl border border-border/70 bg-background p-5 shadow-xs">
            {isDetailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {t(stageLabels[active.stage])}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground">{active.type}</h2>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {format(new Date(active.createdAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-foreground/90">{active.content}</p>
                {active.author && (
                  <p className="mt-2 text-xs text-muted-foreground">{active.author}</p>
                )}

                <div className="mt-6 space-y-3 border-t border-border/50 pt-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MessageSquare className="size-4" />
                    {t('replies')}
                  </h3>

                  {active.replies.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t('noReplies')}</p>
                  ) : (
                    <div className="space-y-3">
                      {active.replies.map((r) => (
                        <div key={r.id} className="rounded-lg bg-muted/30 px-3 py-2.5">
                          <p className="text-sm text-foreground/90">{r.content}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {r.author} · {format(new Date(r.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={t('replyPlaceholder')}
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => void handleReply()}
                        disabled={!reply.trim() || isSubmitting}
                      >
                        {t('replySubmit')}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </article>
        )}
      </div>
    </div>
  )
}
