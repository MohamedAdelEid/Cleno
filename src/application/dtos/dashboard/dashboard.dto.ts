export interface DashboardKpiCardDto {
  count: number
  deltaPercent: number
  sparkline: number[]
}

export interface DashboardOutstandingKpiDto extends DashboardKpiCardDto {
  overdueCount: number
}

export interface DashboardDelayedKpiDto extends DashboardKpiCardDto {
  criticalCount: number
}

export interface DashboardIncidentsKpiDto extends DashboardKpiCardDto {
  escalatedCount: number
}

export interface DashboardKpisDataDto {
  activeOrders: DashboardKpiCardDto
  inLaundry: DashboardKpiCardDto
  outstanding: DashboardOutstandingKpiDto
  activeCustomers: DashboardKpiCardDto
  bagsCirculating: DashboardKpiCardDto
  readyForPickup: DashboardKpiCardDto
  outForDelivery: DashboardKpiCardDto
  delayedOrders: DashboardDelayedKpiDto
  openIncidents: DashboardIncidentsKpiDto
}

export interface DashboardOrderVolumePointDto {
  label: string
  date: string
  count: number
}

export interface DashboardOrderVolumeDataDto {
  totalOrders: number
  deltaPercent: number
  avgPerDay: number
  peakDay: string
  peakCount: number
  series: DashboardOrderVolumePointDto[]
}

export interface DashboardActiveDriverDto {
  slug: string
  name: string
  photo: string | null
  status: 'OnDelivery' | 'Available'
  currentOrderNumber: string | null
  currentOrderSlug: string | null
  taskCount: number
}

export interface DashboardActiveDriversDataDto {
  drivers: DashboardActiveDriverDto[]
}

export interface DashboardAlertDto {
  type: 'DelayedOrder' | 'IssueReported' | 'OpenIncident'
  orderNumber: string
  orderSlug: string
  message: string
  occurredAt: string
}

export interface DashboardRecentOrderDto {
  order: {
    slug: string
    number: string
    pickupDate: string
    expectedDeliveryDate: string
    status: number
    statusLabel: string
  }
  customer: {
    name: string
  }
  branch: {
    slug: string
    name: string
  }
  bags: {
    count: number
  }
  driver: {
    slug: string
    name: string
    photo: string | null
  } | null
}

export interface DashboardActivityItemDto {
  type: string
  module: number
  action: number
  title: string
  description: string
  occurredAt: string
  timeLabel: string
}

export interface DashboardActivityDataDto {
  totalCount: number
  items: DashboardActivityItemDto[]
}

export type DashboardOrderVolumePeriodParam = 'last-week' | 'last-14-days' | 'last-month'

export type DashboardActivityPeriodParam = 'today' | 'yesterday' | 'this-week'

export interface DashboardOrderVolumeParams {
  period?: DashboardOrderVolumePeriodParam
}

export interface DashboardAlertsParams {
  limit?: number
}

export interface DashboardRecentOrdersParams {
  limit?: number
}

export interface DashboardActivityParams {
  period?: DashboardActivityPeriodParam
  date?: string
  search?: string
  module?: number
  action?: number
  limit?: number
}
