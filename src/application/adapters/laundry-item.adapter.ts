import type {
  CreateLaundryItemRequestDto,
  LaundryItemDto,
  LaundryItemsAdminAllParams,
  UpdateLaundryItemRequestDto,
} from '@/application/dtos/laundry-items/laundry-items-admin.dto'
import type { ManagedLaundryItem } from '@/domain/entities'
import type { LaundryItemFormValues } from '@/domain/schemas'

const toManagedLaundryItem = (dto: LaundryItemDto): ManagedLaundryItem => ({
  id: dto.id,
  slug: dto.slug,
  name: dto.name,
  category: dto.category,
  price: dto.price,
  isActive: dto.isActive,
  createdAt: dto.createdAt ?? null,
})

export const laundryItemAdapter = {
  toManagedLaundryItems(items: LaundryItemDto[]): ManagedLaundryItem[] {
    return items.map(toManagedLaundryItem)
  },

  toManagedLaundryItem(dto: LaundryItemDto): ManagedLaundryItem {
    return toManagedLaundryItem(dto)
  },

  toCreateRequest(values: LaundryItemFormValues): CreateLaundryItemRequestDto {
    return {
      name: values.name.trim(),
      category: values.category,
      price: values.price,
    }
  },

  toUpdateRequest(values: LaundryItemFormValues): UpdateLaundryItemRequestDto {
    return {
      name: values.name.trim(),
      category: values.category,
      price: values.price,
    }
  },

  toAllParams(params: LaundryItemsAdminAllParams): Record<string, unknown> {
    const query: Record<string, unknown> = {}

    if (params.pageNumber != null) query.pageNumber = params.pageNumber
    if (params.pageSize != null) query.pageSize = params.pageSize
    if (params.keyword) query.keyword = params.keyword
    if (params.category != null) query.category = params.category
    if (params.isActive != null) query.isActive = params.isActive
    if (params.sortBy) query.sortBy = params.sortBy
    if (params.sortDirection) query.sortDirection = params.sortDirection

    return query
  },
}
