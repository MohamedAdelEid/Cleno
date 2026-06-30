import type {
  IncidentAdminListItemDto,
  IncidentCreateRequestDto,
  IncidentDetailDto,
  IncidentReplyDto,
  IncidentsAdminAllParams,
  IncidentUpdateRequestDto,
} from '@/application/dtos/incidents/incidents-admin.dto'
import type {
  ManagedIncident,
  ManagedIncidentDetail,
  ManagedIncidentReply,
} from '@/domain/entities/managed-incident.entity'
import { IncidentStage, IncidentType } from '@/domain/enums'

const toManagedIncident = (dto: IncidentAdminListItemDto): ManagedIncident => ({
  id: dto.id,
  slug: dto.slug,
  type: dto.type,
  typeLabel: dto.typeLabel,
  stage: dto.stage,
  stageLabel: dto.stageLabel,
  title: dto.title,
  description: dto.description,
  createdAt: dto.createdAt,
  reporterName: dto.reporterName,
  replyCount: dto.replyCount,
  isOpen: dto.isOpen,
  order: dto.order,
  company: dto.company,
  branch: dto.branch,
})

const toReply = (dto: IncidentReplyDto): ManagedIncidentReply => ({
  id: dto.id,
  message: dto.message,
  authorName: dto.authorName,
  createdAt: dto.createdAt,
})

export const incidentAdapter = {
  toManagedIncidents(items: IncidentAdminListItemDto[]): ManagedIncident[] {
    return items.map(toManagedIncident)
  },

  toManagedIncident(dto: IncidentAdminListItemDto): ManagedIncident {
    return toManagedIncident(dto)
  },

  toManagedIncidentDetail(dto: IncidentDetailDto): ManagedIncidentDetail {
    return {
      id: dto.slug,
      slug: dto.slug,
      type: dto.type,
      typeLabel: dto.typeLabel,
      stage: dto.stage,
      stageLabel: dto.stageLabel,
      title: dto.title,
      description: dto.description,
      createdAt: dto.createdAt,
      reporterName: dto.reporterName,
      replyCount: dto.replies.length,
      isOpen: dto.replies.length === 0,
      order: {
        slug: dto.orderSlug,
        number: dto.orderNumber,
        status: 0,
        statusLabel: '',
      },
      company: {
        slug: '',
        name: dto.companyName,
      },
      branch: {
        slug: '',
        name: '',
      },
      orderSlug: dto.orderSlug,
      replies: dto.replies.map(toReply),
    }
  },

  toAllParams(params: IncidentsAdminAllParams): Record<string, unknown> {
    const query: Record<string, unknown> = {}

    if (params.pageNumber != null) query.pageNumber = params.pageNumber
    if (params.pageSize != null) query.pageSize = params.pageSize
    if (params.keyword) query.keyword = params.keyword
    if (params.type != null) query.type = params.type
    if (params.stage != null) query.stage = params.stage
    if (params.isOpen != null) query.isOpen = params.isOpen
    if (params.orderStatus != null) query.orderStatus = params.orderStatus
    if (params.sortBy) query.sortBy = params.sortBy
    if (params.sortDirection) query.sortDirection = params.sortDirection

    return query
  },

  toCreateRequest(values: {
    type: IncidentType
    stage?: IncidentStage
    title?: string
    description: string
  }): IncidentCreateRequestDto {
    const payload: IncidentCreateRequestDto = {
      type: values.type,
      description: values.description.trim(),
    }

    if (values.stage != null) payload.stage = values.stage
    if (values.title?.trim()) payload.title = values.title.trim()

    return payload
  },

  toUpdateRequest(values: {
    type: IncidentType
    stage: IncidentStage
    title?: string
    description: string
  }): IncidentUpdateRequestDto {
    const payload: IncidentUpdateRequestDto = {
      type: values.type,
      stage: values.stage,
      description: values.description.trim(),
    }

    if (values.title?.trim()) payload.title = values.title.trim()

    return payload
  },
}
