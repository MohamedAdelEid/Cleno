import type { CompanyAccountStatus } from '@/domain/enums'
import type { OrderStatus } from '@/domain/enums'

export interface CompanyDetailsBranch {
  id: string
  name: string
  slug: string
  managerName: string
  phone: string
  email: string
  address: string
  googleMapsLink: string
  status: 'active' | 'inactive'
  activeOrders: number
  completedOrders: number
  ordersThisMonth: number
  outstandingBalance: number
  overdueOrders: number
  pendingInvoices: number
}

export interface CompanyInvoice {
  id: string
  invoiceNumber: string
  branchId: string
  branchSlug: string
  branchName: string
  invoiceDate: string
  dueDate: string
  amount: number
  paidAmount: number
  status: 'paid' | 'pending' | 'overdue'
}

export interface CompanyOrder {
  id: string
  orderNumber: string
  branchId: string
  branchSlug: string
  branchName: string
  status: OrderStatus
  itemsCount: number
  bagsCount: number
  pickupDate: string
  deliveryDate: string
}

export type CompanyActivityType =
  | 'order_created'
  | 'order_delivered'
  | 'invoice_generated'
  | 'payment_received'
  | 'branch_added'
  | 'status_changed'
  | 'driver_assigned'
  | 'order_picked_up'

export interface CompanyActivity {
  id: string
  type: CompanyActivityType
  description: string
  user: string
  timestamp: string
  metadata?: Record<string, string>
}

export interface CompanyAlert {
  id: string
  type: 'overdue_invoices' | 'dispatch_ready'
  title: string
  description: string
  count: number
  severity: 'warning' | 'info'
}

export interface CompanyFinancials {
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalBilledAmount: number
  totalPaidAmount: number
  outstandingBalance: number
  collectionRate: number
}

export interface CompanyDetailsData {
  id: string
  slug: string
  name: string
  type: string
  email: string
  phone: string
  logoUrl: string | null
  commercialRegistration: string
  address: string
  googleMapsLink: string
  status: CompanyAccountStatus
  isActive: boolean
  createdAt: string
  responsible: {
    id: string
    fullName: string
    email: string
    phone: string
  }

  stats: {
    branches: number
    activeOrders: number
    completedOrders: number
    ordersThisMonth: number
    outstandingBalance: number
    totalRevenue: number
    pendingInvoices: number
    overdueInvoices: number
  }

  financials: CompanyFinancials
  alerts: CompanyAlert[]
  branches: CompanyDetailsBranch[]
  invoices: CompanyInvoice[]
  recentOrders: CompanyOrder[]
  activities: CompanyActivity[]
}
