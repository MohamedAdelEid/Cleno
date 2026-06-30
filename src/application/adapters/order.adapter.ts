import type { DriverDropdownItemDto } from '@/application/dtos/drivers/drivers-admin.dto'
import type {
  OrderAdminListItemDto,
  OrderTrackingDataDto,
  OrdersDashboardDataDto,
} from '@/application/dtos/orders/orders-admin.dto'
import { parseOrderStatus } from '@/domain/enums/order-status.enum'
import type { ManagedOrder, OrderDriver } from '@/domain/entities'
import { OrderAnalysisInterval } from '@/domain/enums'
import type {
  ActiveShipment,
  OrderAnalysisSummary,
  OrdersOverviewStats,
  ShipmentStepState,
  ShipmentTimelineStep,
} from '@/domain/types'
import { orderAnalysisIntervalToDashboardPeriod } from '@/application/mappers/order-period.mapper'

const niceCeil = (value: number) => Math.ceil((value * 1.12) / 10) * 10

const toWeeklyHighlightIndex = (dayLabels: string[]): number => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayLabel = dayNames[new Date().getDay()]!
  const index = dayLabels.findIndex((label) => label.startsWith(todayLabel.slice(0, 3)))
  return index >= 0 ? index : Math.min(2, Math.max(0, dayLabels.length - 1))
}

const toSegmentedBars = (weeklyTrend: OrdersDashboardDataDto['kpis']['activeOrders']['weeklyTrend']) => {
  const max = Math.max(...weeklyTrend.map((item) => item.activeCount), 1)

  return weeklyTrend.map((item) => ({
    value: item.activeCount,
    label: item.dayLabel,
    top: item.activeCount / max,
    bottom: 1 - item.activeCount / max,
  }))
}

const toSparklinePeakLabel = (points: number[]): string => {
  if (points.length < 2) return ''
  const delta = points[points.length - 1]! - points[0]!
  return `${delta >= 0 ? '+' : ''}${delta}`
}

const toDriver = (dto: OrderAdminListItemDto): OrderDriver | null => {
  if (!dto.driverId || !dto.driverName) return null

  return {
    id: dto.driverId,
    fullName: dto.driverName,
    email: dto.driverEmail ?? '',
    avatarUrl: null,
  }
}

const toPickupIso = (date: string) => `${date}T00:00:00.000Z`
const toExpectedIso = (date: string) => `${date}T00:00:00.000Z`

export const orderAdapter = {
  toManagedOrder(dto: OrderAdminListItemDto): ManagedOrder {
    return {
      id: dto.id,
      slug: dto.slug,
      orderNumber: dto.orderNumber,
      company: {
        id: dto.id,
        name: dto.customerName,
        email: dto.customerEmail,
        type: dto.companyType,
        logoUrl: null,
      },
      branchId: dto.branchName,
      branchName: dto.branchName,
      pickupAt: toPickupIso(dto.pickupDate),
      expectedDeliveryAt: toExpectedIso(dto.expectedDeliveryDate),
      bagCount: dto.bagCount,
      bags: [],
      driver: toDriver(dto),
      status: parseOrderStatus(dto.status),
    }
  },

  toOverviewStats(dto: OrdersDashboardDataDto): OrdersOverviewStats {
    const sparkline = dto.kpis.totalOrders.trendPoints.map((point) => point.count)
    const weeklyTrend = dto.kpis.activeOrders.weeklyTrend

    return {
      totalOrders: dto.kpis.totalOrders.count,
      totalTrendPercent: dto.kpis.totalOrders.deltaPercent,
      totalSparkline: sparkline,
      totalSparklinePeakLabel: toSparklinePeakLabel(sparkline),
      activeOrders: dto.kpis.activeOrders.count,
      activeTrendPercent: dto.kpis.activeOrders.deltaPercent,
      activeSegmentedBars: toSegmentedBars(weeklyTrend),
      activeHighlightIndex: toWeeklyHighlightIndex(weeklyTrend.map((item) => item.dayLabel)),
      deliveredOnTime: dto.kpis.deliveryPerformance.onTime,
      deliveredDelayed: dto.kpis.deliveryPerformance.delayed,
    }
  },

  toAnalysisSummary(
    dto: OrdersDashboardDataDto,
    interval: OrderAnalysisInterval,
  ): OrderAnalysisSummary {
    const points = dto.chart.series.map((point) => ({
      label: point.label,
      delivered: point.delivered,
      cancelled: point.cancelled,
    }))

    const totalOrders = dto.chart.totalOrders
    const totalDelivered = points.reduce((sum, point) => sum + point.delivered, 0)
    const maxVolume = Math.max(...points.map((point) => point.delivered + point.cancelled), 0)

    return {
      interval,
      totalOrders,
      totalDelivered,
      fulfillmentRate: dto.chart.fulfillmentRate,
      axisMax: niceCeil(maxVolume),
      points,
    }
  },

  toTimelineSteps(dto: OrderTrackingDataDto): ShipmentTimelineStep[] {
    let activeAssigned = false

    return dto.timeline.map((step) => {
      let state: ShipmentStepState

      if (step.isActual) {
        state = 'completed'
      } else if (!activeAssigned) {
        state = 'active'
        activeAssigned = true
      } else {
        state = 'upcoming'
      }

      return {
        status: parseOrderStatus(step.status),
        state,
        at: step.occurredAt,
      }
    })
  },

  toActiveShipment(dto: OrderTrackingDataDto): ActiveShipment {
    return {
      orderNumber: dto.orderNumber,
      status: parseOrderStatus(dto.currentStatus),
      destinationLabel: dto.branchAddress,
      mapUrl: dto.branchMapLink,
      steps: orderAdapter.toTimelineSteps(dto),
    }
  },

  toAssignableDriver(dto: DriverDropdownItemDto): OrderDriver {
    return {
      id: dto.id,
      fullName: dto.fullName,
      email: dto.email,
      avatarUrl: null,
    }
  },

  dashboardPeriodForInterval: orderAnalysisIntervalToDashboardPeriod,
}
