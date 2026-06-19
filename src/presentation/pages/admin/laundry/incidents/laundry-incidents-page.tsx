import { format } from 'date-fns'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import type { LaundryIncident } from '@/domain/entities/laundry-order.entity'
import { LaundryWorkflowStage } from '@/domain/enums'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { Textarea } from '@/presentation/components/ui/input'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { cn } from '@/presentation/utils'

import { laundryOrders } from '@/presentation/components/admin/laundry/laundry.data'

const stageLabels: Record<LaundryWorkflowStage, 'stageIncoming' | 'stageProcessing' | 'stageReady'> = {
  [LaundryWorkflowStage.IncomingToLaundry]: 'stageIncoming',
  [LaundryWorkflowStage.InLaundry]: 'stageProcessing',
  [LaundryWorkflowStage.ReadyForDelivery]: 'stageReady',
}

export const LaundryIncidentsPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('laundry')

  const baseOrder = useMemo(
    () => laundryOrders.find((o) => o.id === orderId),
    [orderId],
  )

  const [incidents, setIncidents] = useState<LaundryIncident[]>(baseOrder?.incidents ?? [])
  const [activeId, setActiveId] = useState<string | null>(incidents[0]?.id ?? null)
  const [reply, setReply] = useState('')

  if (!baseOrder) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('orderNotFound')}</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.LAUNDRY.INDEX)}>
          {t('backToLaundry')}
        </Button>
      </div>
    )
  }

  const active = incidents.find((i) => i.id === activeId) ?? incidents[0]

  const handleReply = () => {
    const trimmed = reply.trim()
    if (!trimmed || !active) return

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === active.id
          ? {
              ...inc,
              replies: [
                ...inc.replies,
                {
                  id: `rep-${Date.now()}`,
                  content: trimmed,
                  createdAt: new Date().toISOString(),
                  author: 'Current User',
                },
              ],
            }
          : inc,
      ),
    )
    setReply('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('incidentsPageTitle')}
        description={`${baseOrder.orderNumber} — ${baseOrder.customer.name}`}
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
              onClick={() => setActiveId(incident.id)}
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
            <p className="mt-2 text-xs text-muted-foreground">{active.author}</p>

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
                  <Button size="sm" onClick={handleReply} disabled={!reply.trim()}>
                    {t('replySubmit')}
                  </Button>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
