import { subHours, subMinutes } from 'date-fns'

import { AlertCategory } from '@/domain/enums'
import type { DashboardAlert } from '@/domain/entities'

const now = new Date()

export const dashboardAlertsDummyData: DashboardAlert[] = [
  {
    id: 'alert-1',
    category: AlertCategory.DelayedOrder,
    orderId: 'ord-3',
    orderNumber: 'ORD-2835',
    description: 'Past estimated delivery window by 2h 15m',
    occurredAt: subMinutes(now, 18).toISOString(),
  },
  {
    id: 'alert-2',
    category: AlertCategory.IssueReported,
    orderId: 'ord-6',
    orderNumber: 'ORD-2820',
    description: 'Customer reported missing bag tag on pickup',
    occurredAt: subMinutes(now, 42).toISOString(),
  },
  {
    id: 'alert-3',
    category: AlertCategory.OpenIncident,
    orderId: 'ord-4',
    orderNumber: 'ORD-2830',
    description: 'Damaged items claim — awaiting branch review',
    occurredAt: subHours(now, 1).toISOString(),
  },
  {
    id: 'alert-4',
    category: AlertCategory.DelayedOrder,
    orderId: 'ord-8',
    orderNumber: 'ORD-2810',
    description: 'Driver delayed at laundry handoff',
    occurredAt: subHours(now, 2).toISOString(),
  },
  {
    id: 'alert-5',
    category: AlertCategory.IssueReported,
    orderId: 'ord-2',
    orderNumber: 'ORD-2839',
    description: 'Wrong address submitted — needs confirmation',
    occurredAt: subHours(now, 3).toISOString(),
  },
  {
    id: 'alert-6',
    category: AlertCategory.OpenIncident,
    orderId: 'ord-5',
    orderNumber: 'ORD-2824',
    description: 'Payment dispute escalated to manager',
    occurredAt: subHours(now, 5).toISOString(),
  },
]
