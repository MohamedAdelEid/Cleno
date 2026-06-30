import type {
  DashboardActiveDriverDto,
  DashboardActivityDataDto,
  DashboardActivityItemDto,
  DashboardAlertDto,
  DashboardKpisDataDto,
  DashboardOrderVolumeDataDto,
  DashboardRecentOrderDto,
} from '@/application/dtos/dashboard/dashboard.dto'
import type { ActiveDriver, DashboardAlert, RecentOrder } from '@/domain/entities'
import { AlertCategory, DriverStatus, OrderVolumePeriod } from '@/domain/enums'
import { parseOrderStatus } from '@/domain/enums/order-status.enum'
import type { AdminDashboardKpis, DashboardActivityFeedItem, OrderVolumeSummary } from '@/domain/types'

const toPickupIso = (date: string) => `${date}T00:00:00.000Z`

const toTrendDirection = (deltaPercent: number): 'up' | 'down' | 'neutral' => {
  if (deltaPercent > 0) return 'up'
  if (deltaPercent < 0) return 'down'
  return 'neutral'
}

const toSparklineTrend = (
  deltaPercent: number,
  invertSemantics: boolean,
): 'positive' | 'negative' => {
  const isUp = deltaPercent >= 0
  const isPositive = invertSemantics ? !isUp : isUp
  return isPositive ? 'positive' : 'negative'
}

export const dashboardAdapter = {
  orderVolumePeriodToApi(period: OrderVolumePeriod): 'last-week' | 'last-14-days' | 'last-month' {
    switch (period) {
      case OrderVolumePeriod.LastWeek:
        return 'last-week'
      case OrderVolumePeriod.LastMonth:
        return 'last-month'
      case OrderVolumePeriod.Last14Days:
      default:
        return 'last-14-days'
    }
  },

  toKpis(dto: DashboardKpisDataDto): AdminDashboardKpis {
    return {
      activeOrders: dto.activeOrders,
      inLaundry: dto.inLaundry,
      outstanding: dto.outstanding,
      activeCustomers: dto.activeCustomers,
      bagsCirculating: dto.bagsCirculating,
      readyForPickup: dto.readyForPickup,
      outForDelivery: dto.outForDelivery,
      delayedOrders: dto.delayedOrders,
      openIncidents: dto.openIncidents,
    }
  },

  toOrderVolumeSummary(
    dto: DashboardOrderVolumeDataDto,
    period: OrderVolumePeriod,
    isRtl: boolean,
  ): OrderVolumeSummary {
    const dateLabelFormatter = new Intl.DateTimeFormat(isRtl ? 'ar' : 'en', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    return {
      period,
      total: dto.totalOrders,
      average: dto.avgPerDay,
      changePercent: dto.deltaPercent,
      peakDay: {
        label: dto.peakDay,
        orders: dto.peakCount,
      },
      data: dto.series.map((point) => ({
        date: point.date,
        label: point.label,
        dateLabel: dateLabelFormatter.format(new Date(`${point.date}T00:00:00`)),
        orders: point.count,
      })),
    }
  },

  toActiveDriver(dto: DashboardActiveDriverDto): ActiveDriver {
    return {
      id: dto.slug,
      fullName: dto.name,
      avatarUrl: dto.photo,
      status: dto.status === 'OnDelivery' ? DriverStatus.OnTask : DriverStatus.Idle,
      activeTask: dto.currentOrderNumber,
      taskCount: dto.taskCount > 0 ? dto.taskCount : undefined,
    }
  },

  toActiveDrivers(dto: DashboardActiveDriverDto[]): ActiveDriver[] {
    return dto.map((driver) => dashboardAdapter.toActiveDriver(driver))
  },

  toAlert(dto: DashboardAlertDto, index: number): DashboardAlert {
    const categoryMap: Record<DashboardAlertDto['type'], AlertCategory> = {
      DelayedOrder: AlertCategory.DelayedOrder,
      IssueReported: AlertCategory.IssueReported,
      OpenIncident: AlertCategory.OpenIncident,
    }

    return {
      id: `${dto.orderSlug}-${dto.type}-${index}`,
      category: categoryMap[dto.type],
      orderId: dto.orderSlug,
      orderNumber: dto.orderNumber,
      description: dto.message,
      occurredAt: dto.occurredAt,
    }
  },

  toAlerts(dto: DashboardAlertDto[]): DashboardAlert[] {
    return dto.map((alert, index) => dashboardAdapter.toAlert(alert, index))
  },

  toRecentOrder(dto: DashboardRecentOrderDto): RecentOrder {
    const bagCount = dto.bags.count

    return {
      id: dto.order.slug,
      orderNumber: dto.order.number,
      customerId: '',
      customerName: dto.customer.name,
      branchId: dto.branch.slug,
      branchName: dto.branch.name,
      pickupAt: toPickupIso(dto.order.pickupDate),
      expectedDeliveryAt: toPickupIso(dto.order.expectedDeliveryDate),
      bags: Array.from({ length: bagCount }),
      driver: dto.driver
        ? {
            id: dto.driver.slug,
            fullName: dto.driver.name,
            email: '',
            avatarUrl: dto.driver.photo,
          }
        : null,
      status: parseOrderStatus(dto.order.status),
    }
  },

  toRecentOrders(dto: DashboardRecentOrderDto[]): RecentOrder[] {
    return dto.map((order) => dashboardAdapter.toRecentOrder(order))
  },

  toActivityItem(dto: DashboardActivityItemDto, index: number): DashboardActivityFeedItem {
    return {
      id: `${dto.type}-${dto.occurredAt}-${index}`,
      type: dto.type,
      title: dto.title,
      description: dto.description,
      timeLabel: dto.timeLabel,
      occurredAt: dto.occurredAt,
    }
  },

  toActivityFeed(dto: DashboardActivityDataDto): {
    totalCount: number
    items: DashboardActivityFeedItem[]
  } {
    return {
      totalCount: dto.totalCount,
      items: dto.items.map((item, index) => dashboardAdapter.toActivityItem(item, index)),
    }
  },

  formatDeltaPercent(deltaPercent: number): string {
    const sign = deltaPercent > 0 ? '+' : ''
    return `${sign}${deltaPercent.toFixed(1)}%`
  },

  toTrendDirection,
  toSparklineTrend,
}
