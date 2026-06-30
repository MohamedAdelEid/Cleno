import { incidentAdapter } from '@/application/adapters/incident.adapter'
import type {
  IncidentCreateRequestDto,
  IncidentDetailDto,
  IncidentReplyCreateRequestDto,
  IncidentReplyUpdateRequestDto,
  IncidentsAdminAllParams,
  IncidentsAdminListDto,
  IncidentUpdateRequestDto,
} from '@/application/dtos/incidents/incidents-admin.dto'
import type { OrderIncidentListItemDto } from '@/application/dtos/laundry/laundry-ops.dto'
import type { ManagedIncident, ManagedIncidentDetail } from '@/domain/entities/managed-incident.entity'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export const incidentsApi = {
  async getAdminAll(params: IncidentsAdminAllParams = {}): Promise<ApiResult<ManagedIncident[]>> {
    const result = await httpClient.get<IncidentsAdminListDto>({
      url: API_ENDPOINTS.incidents.adminAll,
      params: incidentAdapter.toAllParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: incidentAdapter.toManagedIncidents(result.data.items ?? []),
    }
  },

  async getBySlug(slug: string): Promise<ApiResult<ManagedIncidentDetail>> {
    const result = await httpClient.get<IncidentDetailDto>({
      url: API_ENDPOINTS.incidents.bySlug(slug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: incidentAdapter.toManagedIncidentDetail(result.data),
    }
  },

  async createForOrder(
    orderSlug: string,
    payload: IncidentCreateRequestDto,
  ): Promise<ApiResult<ManagedIncident>> {
    const result = await httpClient.post<OrderIncidentListItemDto>({
      url: API_ENDPOINTS.incidents.orderIncidents(orderSlug),
      data: payload,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    const dto = result.data

    return {
      ...result,
      data: incidentAdapter.toManagedIncident({
        id: dto.slug,
        slug: dto.slug,
        type: dto.type,
        typeLabel: dto.typeLabel,
        stage: dto.stage,
        stageLabel: dto.stageLabel,
        title: dto.title,
        description: dto.summary,
        createdAt: dto.createdAt,
        reporterName: '',
        replyCount: dto.replyCount,
        isOpen: dto.isOpen,
        order: { slug: orderSlug, number: '', status: 0, statusLabel: '' },
        company: { slug: '', name: '' },
        branch: { slug: '', name: '' },
      }),
    }
  },

  update(slug: string, payload: IncidentUpdateRequestDto): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.incidents.update(slug),
      data: payload,
    })
  },

  delete(slug: string): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.incidents.delete(slug),
    })
  },

  addReply(slug: string, message: string): Promise<ApiResult<boolean>> {
    const payload: IncidentReplyCreateRequestDto = { message }
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.incidents.replies(slug),
      data: payload,
    })
  },

  updateReply(
    slug: string,
    replyId: string,
    message: string,
  ): Promise<ApiResult<boolean>> {
    const payload: IncidentReplyUpdateRequestDto = { message }
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.incidents.replyById(slug, replyId),
      data: payload,
    })
  },

  deleteReply(slug: string, replyId: string): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.incidents.replyById(slug, replyId),
    })
  },
}
