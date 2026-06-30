import { dashboardAdapter } from '@/application/adapters/dashboard.adapter'
import type {
  DashboardActiveDriversDataDto,
  DashboardActivityDataDto,
  DashboardActivityParams,
  DashboardAlertDto,
  DashboardAlertsParams,
  DashboardKpisDataDto,
  DashboardOrderVolumeDataDto,
  DashboardRecentOrderDto,
  DashboardRecentOrdersParams,
} from '@/application/dtos/dashboard/dashboard.dto'
import type { ActiveDriver, DashboardAlert, RecentOrder } from '@/domain/entities'
import { OrderVolumePeriod } from '@/domain/enums'
import type {
  AdminDashboardKpis,
  ApiResult,
  DashboardActivityFeedItem,
  OrderVolumeSummary,
} from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

const parseKpis = (result: ApiResult<DashboardKpisDataDto>): ApiResult<AdminDashboardKpis> => {
  if (!result.hasValue || !result.data) {
    return { ...result, data: null }
  }

  try {
    return { ...result, data: dashboardAdapter.toKpis(result.data) }
  } catch {
    return {
      ...result,
      hasValue: false,
      data: null,
      error: { code: 'ADAPTER_ERROR', message: 'Unable to parse dashboard KPIs.' },
    }
  }
}

const parseOrderVolume = (
  result: ApiResult<DashboardOrderVolumeDataDto>,
  period: OrderVolumePeriod,
  isRtl: boolean,
): ApiResult<OrderVolumeSummary> => {
  if (!result.hasValue || !result.data) {
    return { ...result, data: null }
  }

  try {
    return {
      ...result,
      data: dashboardAdapter.toOrderVolumeSummary(result.data, period, isRtl),
    }
  } catch {
    return {
      ...result,
      hasValue: false,
      data: null,
      error: { code: 'ADAPTER_ERROR', message: 'Unable to parse order volume.' },
    }
  }
}

export const dashboardApi = {
  getKpis(): Promise<ApiResult<AdminDashboardKpis>> {
    return httpClient
      .get<DashboardKpisDataDto>({ url: API_ENDPOINTS.dashboard.kpis })
      .then(parseKpis)
  },

  getOrderVolume(
    period: OrderVolumePeriod = OrderVolumePeriod.Last14Days,
    isRtl = false,
  ): Promise<ApiResult<OrderVolumeSummary>> {
    const params: Record<string, unknown> = {
      period: dashboardAdapter.orderVolumePeriodToApi(period),
    }

    return httpClient
      .get<DashboardOrderVolumeDataDto>({
        url: API_ENDPOINTS.dashboard.orderVolume,
        params,
      })
      .then((result) => parseOrderVolume(result, period, isRtl))
  },

  async getActiveDrivers(): Promise<ApiResult<ActiveDriver[]>> {
    const result = await httpClient.get<DashboardActiveDriversDataDto>({
      url: API_ENDPOINTS.dashboard.activeDrivers,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: dashboardAdapter.toActiveDrivers(result.data.drivers ?? []),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: { code: 'ADAPTER_ERROR', message: 'Unable to parse active drivers.' },
      }
    }
  },

  async getAlerts(params: DashboardAlertsParams = {}): Promise<ApiResult<DashboardAlert[]>> {
    const result = await httpClient.get<DashboardAlertDto[]>({
      url: API_ENDPOINTS.dashboard.alerts,
      params: { limit: params.limit ?? 10 },
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: dashboardAdapter.toAlerts(result.data),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: { code: 'ADAPTER_ERROR', message: 'Unable to parse dashboard alerts.' },
      }
    }
  },

  async getRecentOrders(
    params: DashboardRecentOrdersParams = {},
  ): Promise<ApiResult<RecentOrder[]>> {
    const result = await httpClient.get<DashboardRecentOrderDto[]>({
      url: API_ENDPOINTS.dashboard.recentOrders,
      params: { limit: params.limit ?? 10 },
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: dashboardAdapter.toRecentOrders(result.data),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: { code: 'ADAPTER_ERROR', message: 'Unable to parse recent orders.' },
      }
    }
  },

  async getActivity(params: DashboardActivityParams = {}): Promise<
    ApiResult<{
      totalCount: number
      items: DashboardActivityFeedItem[]
    }>
  > {
    const result = await httpClient.get<DashboardActivityDataDto>({
      url: API_ENDPOINTS.dashboard.activity,
      params: {
        period: params.period ?? 'this-week',
        date: params.date,
        search: params.search || undefined,
        module: params.module,
        action: params.action,
        limit: params.limit ?? 50,
      },
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: dashboardAdapter.toActivityFeed(result.data),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: { code: 'ADAPTER_ERROR', message: 'Unable to parse dashboard activity.' },
      }
    }
  },
}
