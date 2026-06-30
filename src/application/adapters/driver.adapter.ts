import type {
  CreateDriverRequestDto,
  DriverDto,
  DriverDropdownItemDto,
  DriversAdminAllParams,
  UpdateDriverRequestDto,
} from '@/application/dtos/drivers/drivers-admin.dto'
import type { ManagedDriver } from '@/domain/entities'
import type { DriverFormValues } from '@/domain/schemas'
import { DriverAvailability } from '@/domain/enums/driver-availability.enum'
import type { DriverAvailability as DriverAvailabilityType } from '@/domain/enums/driver-availability.enum'

const API_STATUS_TO_DOMAIN: Record<number, DriverAvailabilityType> = {
  1: DriverAvailability.Available,
  2: DriverAvailability.Unavailable,
}

const DOMAIN_STATUS_TO_API: Record<DriverAvailabilityType, number> = {
  [DriverAvailability.Available]: 1,
  [DriverAvailability.Unavailable]: 2,
}

const parseStatus = (status: number): DriverAvailabilityType =>
  API_STATUS_TO_DOMAIN[status] ?? DriverAvailability.Available

const toManagedDriver = (dto: DriverDto): ManagedDriver => ({
  id: dto.id,
  slug: dto.slug,
  fullName: dto.fullName,
  email: dto.email,
  phone: dto.phone,
  photoUrl: dto.photo?.url || null,
  photoPath: dto.photo?.path ?? null,
  status: parseStatus(dto.status),
  ordersCount: dto.ordersCount ?? 0,
  createdAt: dto.createdAt ?? null,
})

const resolvePhotoPath = (values: DriverFormValues): string | null | undefined => {
  if (values.removePhoto) return null
  if (values.photoPath) return values.photoPath
  return undefined
}

export const driverAdapter = {
  statusToApi(status: DriverAvailabilityType): number {
    return DOMAIN_STATUS_TO_API[status]
  },

  toManagedDrivers(items: DriverDto[]): ManagedDriver[] {
    return items.map(toManagedDriver)
  },

  toManagedDriver(dto: DriverDto): ManagedDriver {
    return toManagedDriver(dto)
  },

  toCreateRequest(values: DriverFormValues): CreateDriverRequestDto {
    const photo = resolvePhotoPath(values)

    return {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      password: values.password ?? '',
      status: DOMAIN_STATUS_TO_API[values.status],
      ...(photo !== undefined ? { photo } : {}),
    }
  },

  toUpdateRequest(values: DriverFormValues): UpdateDriverRequestDto {
    const photo = resolvePhotoPath(values)

    return {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      status: DOMAIN_STATUS_TO_API[values.status],
      ...(photo !== undefined ? { photo } : {}),
    }
  },

  toAllParams(params: DriversAdminAllParams): Record<string, unknown> {
    const query: Record<string, unknown> = {}

    if (params.pageNumber != null) query.pageNumber = params.pageNumber
    if (params.pageSize != null) query.pageSize = params.pageSize
    if (params.keyword) query.keyword = params.keyword
    if (params.status != null) query.status = params.status
    if (params.sortBy) query.sortBy = params.sortBy
    if (params.sortDirection) query.sortDirection = params.sortDirection

    return query
  },

  toDropdownItem(dto: DriverDropdownItemDto) {
    return {
      id: dto.id,
      slug: dto.slug,
      fullName: dto.fullName,
      email: dto.email,
      status: parseStatus(dto.status),
    }
  },
}
