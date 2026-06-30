export interface DashboardKpiCard {
  count: number
  deltaPercent: number
  sparkline: number[]
}

export interface DashboardOutstandingKpi extends DashboardKpiCard {
  overdueCount: number
}

export interface DashboardDelayedKpi extends DashboardKpiCard {
  criticalCount: number
}

export interface DashboardIncidentsKpi extends DashboardKpiCard {
  escalatedCount: number
}

export interface AdminDashboardKpis {
  activeOrders: DashboardKpiCard
  inLaundry: DashboardKpiCard
  outstanding: DashboardOutstandingKpi
  activeCustomers: DashboardKpiCard
  bagsCirculating: DashboardKpiCard
  readyForPickup: DashboardKpiCard
  outForDelivery: DashboardKpiCard
  delayedOrders: DashboardDelayedKpi
  openIncidents: DashboardIncidentsKpi
}

export type DashboardActivityPeriod = 'today' | 'yesterday' | 'this-week'

export interface DashboardActivityFeedItem {
  id: string
  type: string
  title: string
  description: string
  timeLabel: string
  occurredAt: string
}
