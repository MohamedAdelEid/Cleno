import type {
  BagDetailsDto,
  BagListItemDto,
  BagsAdminAllParams,
  BagsStatsDto,
  CreateBagRequestDto,
  UpdateBagRequestDto,
} from '@/application/dtos/bags/bags-admin.dto'
import type {
  OperationalBag,
  OperationalBagCompany,
  OperationalBagStatTrends,
  OperationalBagStats,
} from '@/domain/entities'
import type { BagCompanyDto } from '@/application/dtos/bags/bags-admin.dto'
import type { OperationalBagFormValues } from '@/domain/schemas'
import { OperationalBagStatus, OperationalBagSystemStatus } from '@/domain/enums'
import type {
  OperationalBagStatus as OperationalBagStatusType,
  OperationalBagSystemStatus as OperationalBagSystemStatusType,
} from '@/domain/enums'

const API_STATUS_TO_DOMAIN: Record<number, OperationalBagStatusType> = {
  1: OperationalBagStatus.Ready,
  2: OperationalBagStatus.Assigned,
  3: OperationalBagStatus.Processing,
  4: OperationalBagStatus.OnTheWay,
  5: OperationalBagStatus.InTransit,
  6: OperationalBagStatus.Missing,
}

const DOMAIN_STATUS_TO_API: Record<OperationalBagStatusType, number> = {
  [OperationalBagStatus.Ready]: 1,
  [OperationalBagStatus.Assigned]: 2,
  [OperationalBagStatus.Processing]: 3,
  [OperationalBagStatus.OnTheWay]: 4,
  [OperationalBagStatus.InTransit]: 5,
  [OperationalBagStatus.Missing]: 6,
}

const DOMAIN_SYSTEM_TO_API: Record<OperationalBagSystemStatusType, boolean> = {
  [OperationalBagSystemStatus.Active]: true,
  [OperationalBagSystemStatus.Inactive]: false,
}

const parseOperationalStatus = (status: number): OperationalBagStatusType =>
  API_STATUS_TO_DOMAIN[status] ?? OperationalBagStatus.Ready

const parseSystemStatus = (isActive: boolean): OperationalBagSystemStatusType =>
  isActive ? OperationalBagSystemStatus.Active : OperationalBagSystemStatus.Inactive

const toTrend = (trend: number[] | undefined): number[] => {
  const values = Array.isArray(trend) ? trend.filter((value) => Number.isFinite(value)) : []
  return [...Array.from({ length: Math.max(0, 7 - values.length) }, () => 0), ...values].slice(-7)
}

const toCountStats = (dto: BagsStatsDto): OperationalBagStats => ({
  totalBags: dto.totalBags?.count ?? 0,
  activeBags: dto.activeBags?.count ?? 0,
  inactiveBags: dto.inactiveBags?.count ?? 0,
  assignedBags: dto.assignedBags?.count ?? 0,
  processingBags: dto.processingBags?.count ?? 0,
  missingBags: dto.missingBags?.count ?? 0,
  readyBags: dto.readyBags?.count ?? 0,
})

const toCompany = (dto: BagCompanyDto | null | undefined): OperationalBagCompany | null => {
  if (!dto?.id || !dto.name) return null

  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? null,
    photo: dto.photo ?? null,
  }
}

const companyFromLegacyName = (companyName?: string | null): OperationalBagCompany | null => {
  const name = companyName?.trim()
  if (!name) return null

  return {
    id: '',
    name,
    email: null,
    photo: null,
  }
}

const toTrendStats = (dto: BagsStatsDto): OperationalBagStatTrends => ({
  totalBags: toTrend(dto.totalBags?.trend),
  activeBags: toTrend(dto.activeBags?.trend),
  inactiveBags: toTrend(dto.inactiveBags?.trend),
  assignedBags: toTrend(dto.assignedBags?.trend),
  processingBags: toTrend(dto.processingBags?.trend),
  missingBags: toTrend(dto.missingBags?.trend),
  readyBags: toTrend(dto.readyBags?.trend),
})

const toOperationalBagFromList = (dto: BagListItemDto): OperationalBag => ({
  id: dto.id,
  slug: dto.slug,
  bagId: dto.number,
  notes: dto.notes ?? '',
  weight: dto.weight ?? null,
  systemStatus: parseSystemStatus(dto.isActive),
  operationalStatus: parseOperationalStatus(dto.operationalStatus),
  currentOrderId: dto.currentOrder?.id ?? null,
  currentOrderSlug: dto.currentOrder?.slug ?? null,
  currentOrderNumber: dto.currentOrder?.name ?? null,
  company: toCompany(dto.company) ?? companyFromLegacyName(dto.companyName),
  createdAt: null,
  updatedAt: dto.updatedAt ?? new Date().toISOString(),
  assignmentHistory: [],
})

export const bagAdapter = {
  statusToApi(status: OperationalBagStatusType): number {
    return DOMAIN_STATUS_TO_API[status]
  },

  toStats(dto: BagsStatsDto): { stats: OperationalBagStats; trends: OperationalBagStatTrends } {
    return {
      stats: toCountStats(dto),
      trends: toTrendStats(dto),
    }
  },

  toOperationalBags(items: BagListItemDto[]): OperationalBag[] {
    return items.map(toOperationalBagFromList)
  },

  toOperationalBagDetails(dto: BagDetailsDto): OperationalBag {
    return {
      id: dto.id,
      slug: dto.slug,
      bagId: dto.number,
      notes: dto.notes ?? '',
      weight: dto.weight ?? null,
      systemStatus: parseSystemStatus(dto.isActive),
      operationalStatus: parseOperationalStatus(dto.operationalStatus),
      currentOrderId: dto.currentOrder?.id ?? null,
      currentOrderSlug: dto.currentOrder?.slug ?? null,
      currentOrderNumber: dto.currentOrder?.orderNumber ?? null,
      company: companyFromLegacyName(dto.currentOrder?.companyName),
      createdAt: dto.createdAt ?? null,
      updatedAt: dto.updatedAt ?? new Date().toISOString(),
      assignmentHistory: (dto.assignmentHistory ?? []).map((item) => ({
        orderId: item.orderId,
        orderSlug: item.orderSlug,
        orderNumber: item.orderNumber,
        companyName: item.companyName,
        assignedAt: item.assignedAt ?? null,
      })),
    }
  },

  toCreateRequest(values: OperationalBagFormValues): CreateBagRequestDto {
    return {
      number: values.bagId,
      notes: values.notes?.trim() || null,
      weight: values.weight ?? null,
    }
  },

  toUpdateRequest(values: OperationalBagFormValues): UpdateBagRequestDto {
    return {
      number: values.bagId,
      notes: values.notes?.trim() || null,
      weight: values.weight ?? null,
      isActive: DOMAIN_SYSTEM_TO_API[values.systemStatus],
      status: DOMAIN_STATUS_TO_API[values.operationalStatus],
    }
  },

  toAllParams(params: BagsAdminAllParams): Record<string, unknown> {
    const query: Record<string, unknown> = {}

    if (params.pageNumber != null) query.pageNumber = params.pageNumber
    if (params.pageSize != null) query.pageSize = params.pageSize
    if (params.keyword) query.keyword = params.keyword
    if (params.isActive != null) query.isActive = params.isActive
    if (params.operationalStatus != null) query.operationalStatus = params.operationalStatus
    if (params.sortBy) query.sortBy = params.sortBy
    if (params.sortDirection) query.sortDirection = params.sortDirection

    return query
  },
}
