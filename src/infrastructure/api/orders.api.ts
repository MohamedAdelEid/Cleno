import type {
  OrderAssignDriverRequestDto,
  OrderTrackingDataDto,
  OrderUpdateStatusRequestDto,
  OrdersAdminAllDataDto,
  OrdersAdminAllParams,
  OrdersDashboardDataDto,
} from '@/application/dtos/orders/orders-admin.dto'
import { orderAdapter } from '@/application/adapters/order.adapter'
import type { ManagedOrder } from '@/domain/entities'
import { OrderAnalysisInterval } from '@/domain/enums'
import type {
  ActiveShipment,
  ApiResult,
  OrderAnalysisSummary,
  OrdersOverviewStats,
} from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

const buildOrdersQueryParams = (params: OrdersAdminAllParams): Record<string, unknown> => {
  const query: Record<string, unknown> = {}

  if (params.keyword) query.keyword = params.keyword
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.status != null) query.status = params.status
  if (params.paymentStatus != null) query.paymentStatus = params.paymentStatus
  if (params.companyId) query.companyId = params.companyId
  if (params.pickupDateFrom) query.pickupDateFrom = params.pickupDateFrom
  if (params.pickupDateTo) query.pickupDateTo = params.pickupDateTo
  if (params.sortBy) query.sortBy = params.sortBy
  if (params.sortDirection) query.sortDirection = params.sortDirection

  return query
}

const parseList = (result: ApiResult<OrdersAdminAllDataDto>) => {
  if (!result.hasValue || !result.data) {
    return { ...result, data: null as ManagedOrder[] | null }
  }

  try {
    return {
      ...result,
      data: (result.data.items ?? []).map((item) => orderAdapter.toManagedOrder(item)),
    }
  } catch {
    return {
      ...result,
      hasValue: false,
      data: null,
      error: {
        code: 'ADAPTER_ERROR',
        message: 'Unable to parse orders response.',
      },
    }
  }
}

export const ordersApi = {
  async getDashboard(
    period: OrderAnalysisInterval = OrderAnalysisInterval.Monthly,
  ): Promise<
    ApiResult<{
      overview: OrdersOverviewStats
      analysis: OrderAnalysisSummary
    }>
  > {
    const dashboardPeriod = orderAdapter.dashboardPeriodForInterval(period)
    const result = await httpClient.get<OrdersDashboardDataDto>({
      url: API_ENDPOINTS.orders.adminDashboard,
      params: { period: dashboardPeriod },
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: {
          overview: orderAdapter.toOverviewStats(result.data),
          analysis: orderAdapter.toAnalysisSummary(result.data, period),
        },
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: {
          code: 'ADAPTER_ERROR',
          message: 'Unable to parse orders dashboard response.',
        },
      }
    }
  },

  async getAdminAll(params: OrdersAdminAllParams = {}) {
    const result = await httpClient.get<OrdersAdminAllDataDto>({
      url: API_ENDPOINTS.orders.adminAll,
      params: buildOrdersQueryParams(params),
    })

    return parseList(result)
  },

  async getTracking(slug: string): Promise<ApiResult<ActiveShipment>> {
    const result = await httpClient.get<OrderTrackingDataDto>({
      url: API_ENDPOINTS.orders.adminTracking(slug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: orderAdapter.toActiveShipment(result.data),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: {
          code: 'ADAPTER_ERROR',
          message: 'Unable to parse order tracking response.',
        },
      }
    }
  },

  updateStatus(slug: string, status: number): Promise<ApiResult<boolean>> {
    const payload: OrderUpdateStatusRequestDto = { status }
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.orders.adminStatus(slug),
      data: payload,
    })
  },

  assignDriver(slug: string, driverId: string | null): Promise<ApiResult<boolean>> {
    const payload: OrderAssignDriverRequestDto = { driverId }
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.orders.adminDriver(slug),
      data: payload,
    })
  },
}

export { driversApi } from './drivers.api'
