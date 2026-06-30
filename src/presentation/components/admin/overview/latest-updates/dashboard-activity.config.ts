import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  CreditCard,
  Package,
  RefreshCw,
  Shield,
  Ticket,
  Truck,
  UserRound,
  WashingMachine,
} from 'lucide-react'

interface DashboardActivityVisual {
  icon: LucideIcon
  iconClassName: string
}

const defaultVisual: DashboardActivityVisual = {
  icon: ClipboardList,
  iconClassName:
    'border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/50 dark:bg-slate-950/40 dark:text-slate-400',
}

const activityVisualMap: Record<string, DashboardActivityVisual> = {
  NewCustomerAdded: {
    icon: UserRound,
    iconClassName:
      'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  CompanyApproved: {
    icon: Shield,
    iconClassName:
      'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  CompanyRejected: {
    icon: AlertTriangle,
    iconClassName:
      'border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
  },
  BranchCreated: {
    icon: Package,
    iconClassName:
      'border-sky-200/80 bg-sky-50 text-sky-600 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-400',
  },
  OrderCreated: {
    icon: Ticket,
    iconClassName:
      'border-blue-200/80 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400',
  },
  OrderUpdated: {
    icon: Ticket,
    iconClassName:
      'border-blue-200/80 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400',
  },
  OrderCompleted: {
    icon: Truck,
    iconClassName:
      'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  StaffReassigned: {
    icon: RefreshCw,
    iconClassName:
      'border-violet-200/80 bg-violet-50 text-violet-600 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-400',
  },
  IssueReported: {
    icon: AlertTriangle,
    iconClassName:
      'border-amber-200/80 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400',
  },
  InvoiceGenerated: {
    icon: BookOpen,
    iconClassName:
      'border-teal-200/80 bg-teal-50 text-teal-600 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-400',
  },
  PaymentReceived: {
    icon: CreditCard,
    iconClassName:
      'border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  OrderNoteAdded: {
    icon: ClipboardList,
    iconClassName:
      'border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/50 dark:bg-slate-950/40 dark:text-slate-400',
  },
  UserCreated: {
    icon: UserRound,
    iconClassName:
      'border-indigo-200/80 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  UserUpdated: {
    icon: UserRound,
    iconClassName:
      'border-indigo-200/80 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  UserStatusChanged: {
    icon: RefreshCw,
    iconClassName:
      'border-amber-200/80 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400',
  },
  UserDeleted: {
    icon: AlertTriangle,
    iconClassName:
      'border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
  },
  DriverCreated: {
    icon: Truck,
    iconClassName:
      'border-indigo-200/80 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  DriverUpdated: {
    icon: Truck,
    iconClassName:
      'border-indigo-200/80 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  DriverStatusChanged: {
    icon: RefreshCw,
    iconClassName:
      'border-amber-200/80 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400',
  },
  DriverDeleted: {
    icon: AlertTriangle,
    iconClassName:
      'border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
  },
  BagCreated: {
    icon: Package,
    iconClassName:
      'border-teal-200/80 bg-teal-50 text-teal-600 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-400',
  },
  BagUpdated: {
    icon: Package,
    iconClassName:
      'border-teal-200/80 bg-teal-50 text-teal-600 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-400',
  },
  BagDeleted: {
    icon: AlertTriangle,
    iconClassName:
      'border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
  },
  LaundryItemCreated: {
    icon: WashingMachine,
    iconClassName:
      'border-violet-200/80 bg-violet-50 text-violet-600 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-400',
  },
  LaundryItemUpdated: {
    icon: WashingMachine,
    iconClassName:
      'border-violet-200/80 bg-violet-50 text-violet-600 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-400',
  },
  LaundryItemDeleted: {
    icon: AlertTriangle,
    iconClassName:
      'border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
  },
  TimeSlotCreated: {
    icon: ClipboardList,
    iconClassName:
      'border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/50 dark:bg-slate-950/40 dark:text-slate-400',
  },
  TimeSlotUpdated: {
    icon: ClipboardList,
    iconClassName:
      'border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/50 dark:bg-slate-950/40 dark:text-slate-400',
  },
  RoleCreated: {
    icon: Shield,
    iconClassName:
      'border-indigo-200/80 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  RoleUpdated: {
    icon: Shield,
    iconClassName:
      'border-indigo-200/80 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  RoleUserAssigned: {
    icon: UserRound,
    iconClassName:
      'border-indigo-200/80 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  RoleUserUnassigned: {
    icon: UserRound,
    iconClassName:
      'border-amber-200/80 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400',
  },
  RoleDeleted: {
    icon: AlertTriangle,
    iconClassName:
      'border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
  },
  SlaBreachRisk: {
    icon: AlertTriangle,
    iconClassName:
      'border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
  },
  Activity: defaultVisual,
}

export const getDashboardActivityVisual = (type: string): DashboardActivityVisual =>
  activityVisualMap[type] ?? defaultVisual
