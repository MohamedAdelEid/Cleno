import type {
  CompanyDropdownItemDto,
  LaundryBoardDataDto,
  LaundryBoardParams,
  LaundryBoardStatsDto,
  LaundryBulkStatusDataDto,
  LaundryBulkStatusRequestDto,
  LaundryOverdueAlertDto,
  OrderBagCreateRequestDto,
  OrderBagUpdateRequestDto,
  OrderBagsDataDto,
  OrderNoteCreateRequestDto,
  OrderNotesDataDto,
} from '@/application/dtos/laundry/laundry-ops.dto'
import { laundryAdapter } from '@/application/adapters/laundry.adapter'
import type {
  ItemBagAssignment,
  LaundryOrder,
  LaundryOrderNote,
  LaundryStats,
} from '@/domain/entities/laundry-order.entity'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

const parseAdapterError = <T>(message: string): ApiResult<T> => ({
  hasValue: false,
  data: null,
  error: { code: 'ADAPTER_ERROR', message },
  status: 'Error',
  statusCode: 500,
  message,
})

const buildBoardParams = (params: LaundryBoardParams): Record<string, unknown> => {
  const query: Record<string, unknown> = { tab: params.tab }

  if (params.search) query.search = params.search
  if (params.companyId) query.companyId = params.companyId
  if (params.sortBy) query.sortBy = params.sortBy

  return query
}

export const laundryApi = {
  async getBoardStats(): Promise<ApiResult<LaundryStats>> {
    const result = await httpClient.get<LaundryBoardStatsDto>({
      url: API_ENDPOINTS.laundry.boardStats,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return { ...result, data: laundryAdapter.toStats(result.data) }
    } catch {
      return parseAdapterError('Unable to parse laundry board stats.')
    }
  },

  async getOverdueAlert(): Promise<
    ApiResult<{ count: number; orders: { slug: string; orderNumber: string }[] }>
  > {
    const result = await httpClient.get<LaundryOverdueAlertDto>({
      url: API_ENDPOINTS.laundry.overdueAlert,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return { ...result, data: laundryAdapter.toOverdueAlert(result.data) }
    } catch {
      return parseAdapterError('Unable to parse overdue alert.')
    }
  },

  async getBoardOrders(params: LaundryBoardParams): Promise<ApiResult<LaundryOrder[]>> {
    const result = await httpClient.get<LaundryBoardDataDto>({
      url: API_ENDPOINTS.laundry.board,
      params: buildBoardParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: (result.data.items ?? []).map((item) => laundryAdapter.toLaundryOrder(item)),
      }
    } catch {
      return parseAdapterError('Unable to parse laundry board orders.')
    }
  },

  bulkStatus(payload: LaundryBulkStatusRequestDto): Promise<ApiResult<LaundryBulkStatusDataDto>> {
    return httpClient.put<LaundryBulkStatusDataDto>({
      url: API_ENDPOINTS.laundry.bulkStatus,
      data: payload,
    })
  },

  async getNotes(slug: string): Promise<ApiResult<LaundryOrderNote[]>> {
    const result = await httpClient.get<OrderNotesDataDto>({
      url: API_ENDPOINTS.laundry.notes(slug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return { ...result, data: laundryAdapter.toOrderNotes(result.data) }
    } catch {
      return parseAdapterError('Unable to parse order notes.')
    }
  },

  addNote(slug: string, content: string): Promise<ApiResult<boolean>> {
    const payload: OrderNoteCreateRequestDto = { content }
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.laundry.notes(slug),
      data: payload,
    })
  },

  updateNote(slug: string, content: string): Promise<ApiResult<boolean>> {
    const payload: OrderNoteCreateRequestDto = { content }
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.laundry.notes(slug),
      data: payload,
    })
  },

  getBags(slug: string): Promise<ApiResult<OrderBagsDataDto>> {
    return httpClient.get<OrderBagsDataDto>({
      url: API_ENDPOINTS.laundry.bags(slug),
    })
  },

  createBagAssignment(
    slug: string,
    payload: OrderBagCreateRequestDto,
  ): Promise<ApiResult<boolean>> {
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.laundry.bags(slug),
      data: payload,
    })
  },

  updateBagAssignment(
    slug: string,
    assignmentId: string,
    payload: OrderBagUpdateRequestDto,
  ): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.laundry.bagById(slug, assignmentId),
      data: payload,
    })
  },

  deleteBagAssignment(slug: string, assignmentId: string): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.laundry.bagById(slug, assignmentId),
    })
  },
}

export const companiesDropdownApi = {
  async getDropdown(): Promise<ApiResult<CompanyDropdownItemDto[]>> {
    return httpClient.get<CompanyDropdownItemDto[]>({
      url: API_ENDPOINTS.companies.dropdown,
    })
  },
}

export type { ItemBagAssignment, OrderBagsDataDto }
