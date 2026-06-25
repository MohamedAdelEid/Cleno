export interface OrdersTrendPointDto {
  label: string
  count: number
}

export interface OrdersWeeklyTrendDto {
  dayLabel: string
  activeCount: number
}

export interface OrdersDashboardKpisDto {
  totalOrders: {
    count: number
    deltaPercent: number
    trendPoints: OrdersTrendPointDto[]
  }
  activeOrders: {
    count: number
    deltaPercent: number
    weeklyTrend: OrdersWeeklyTrendDto[]
  }
  deliveryPerformance: {
    onTime: number
    delayed: number
    total: number
  }
}

export interface OrdersChartSeriesPointDto {
  label: string
  delivered: number
  cancelled: number
}

export interface OrdersDashboardChartDto {
  totalOrders: number
  fulfillmentRate: number
  series: OrdersChartSeriesPointDto[]
}

export interface OrdersDashboardDataDto {
  kpis: OrdersDashboardKpisDto
  chart: OrdersDashboardChartDto
}

export interface OrderAdminListItemDto {
  id: string
  slug: string
  orderNumber: string
  customerName: string
  customerEmail: string
  companyType: string
  branchName: string
  pickupDate: string
  expectedDeliveryDate: string
  bagCount: number
  driverId: string | null
  driverSlug: string | null
  driverName: string | null
  driverEmail: string | null
  status: number
  paymentStatus: number
  totalAmount: number
  createdAt: string
}

export interface OrdersAdminAllDataDto {
  items: OrderAdminListItemDto[]
}

export interface OrdersAdminAllParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  status?: number
  paymentStatus?: number
  companyId?: string
  pickupDateFrom?: string
  pickupDateTo?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface OrderTrackingTimelineItemDto {
  status: number
  label: string
  occurredAt: string
  isActual: boolean
}

export interface OrderTrackingDataDto {
  orderNumber: string
  currentStatus: number
  branchMapLink: string
  branchAddress: string
  driverName: string | null
  driverEmail: string | null
  timeline: OrderTrackingTimelineItemDto[]
}

export interface OrderUpdateStatusRequestDto {
  status: number
}

export interface OrderAssignDriverRequestDto {
  driverId: string | null
}

export interface DriverDropdownItemDto {
  id: string
  slug: string
  fullName: string
  email: string
  status: number
}
