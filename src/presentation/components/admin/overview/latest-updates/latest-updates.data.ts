import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  RefreshCw,
  Star,
  Ticket,
  UserRound,
} from 'lucide-react'
import type { ActivityItem } from './latest-updates.types'

const hoursAgo = (hours: number) => {
  const date = new Date()
  date.setHours(date.getHours() - hours, 0, 0, 0)
  return date
}

const daysAgo = (days: number, hour = 10) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 20, 0, 0)
  return date
}

export const latestUpdatesDummyData: ActivityItem[] = [
  {
    id: '1',
    icon: Ticket,
    iconClassName: 'border-blue-200/80 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400',
    title: 'Order Updated',
    description: 'Order #2319 status changed to In Laundry',
    time: '11:20 AM',
    occurredAt: hoursAgo(1),
  },
  {
    id: '2',
    icon: UserRound,
    iconClassName: 'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
    title: 'New Customer Added',
    description: 'Ahmed Hassan registered as a new client',
    time: '10:45 AM',
    occurredAt: hoursAgo(2),
  },
  {
    id: '3',
    icon: RefreshCw,
    iconClassName: 'border-violet-200/80 bg-violet-50 text-violet-600 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-400',
    title: 'Staff Reassigned',
    description: 'Order #2301 moved to Branch Downtown',
    time: '09:30 AM',
    occurredAt: hoursAgo(4),
  },
  {
    id: '4',
    icon: AlertTriangle,
    iconClassName: 'border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
    title: 'SLA Breach Risk',
    description: 'Order #2298 approaching delivery deadline',
    time: '08:15 AM',
    occurredAt: hoursAgo(6),
  },
  {
    id: '5',
    icon: BookOpen,
    iconClassName: 'border-teal-200/80 bg-teal-50 text-teal-600 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-400',
    title: 'Service Catalog',
    description: 'Dry cleaning price list updated',
    time: '04:10 PM',
    occurredAt: daysAgo(1, 16),
  },
  {
    id: '6',
    icon: Star,
    iconClassName: 'border-amber-200/80 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400',
    title: 'Customer Feedback',
    description: '5-star rating received from Sara Ali',
    time: '02:30 PM',
    occurredAt: daysAgo(2, 14),
  },
  {
    id: '7',
    icon: Ticket,
    iconClassName: 'border-blue-200/80 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400',
    title: 'Order Completed',
    description: 'Order #2280 marked as delivered',
    time: '11:00 AM',
    occurredAt: hoursAgo(10),
  },
  {
    id: '8',
    icon: UserRound,
    iconClassName: 'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
    title: 'New Customer Added',
    description: 'Layla Mansour registered as a new client',
    time: '09:45 AM',
    occurredAt: hoursAgo(10),
  },
  {
    id: '9',
    icon: ClipboardList,
    iconClassName: 'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
    title: 'New Customer Added',
    description: 'Ahmed Hassan registered as a new client',
    time: '09:45 AM',
    occurredAt: hoursAgo(10),
  },
  {
    id: '10',
    icon: ClipboardList,
    iconClassName: 'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
    title: 'New Customer Added',
    description: 'Sara Ali registered as a new client',
    time: '09:45 AM',
    occurredAt: hoursAgo(10),
  },
  {
    id: '11',
    icon: ClipboardList,
    iconClassName: 'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
    title: 'New Customer Added',
    description: 'Layla Mansour registered as a new client',
    time: '09:45 AM',
    occurredAt: hoursAgo(10),
  },  {
    id: '12',
    icon: ClipboardList,
    iconClassName: 'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
    title: 'New Customer Added',
    description: 'Ahmed Hassan registered as a new client',
    time: '09:45 AM',
    occurredAt: hoursAgo(10),
  },
  {
    id: '13',
    icon: ClipboardList,
    iconClassName: 'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
    title: 'New Customer Added',
    description: 'Sara Ali registered as a new client',
    time: '09:45 AM',
    occurredAt: hoursAgo(10),
  },
  {
    id: '14',
    icon: ClipboardList,
    iconClassName: 'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
    title: 'New Customer Added',
    description: 'Sara Ali registered as a new client',
    time: '09:45 AM',
    occurredAt: hoursAgo(10),
  },
]
