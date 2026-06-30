import type { LaundryItemCategory } from '@/domain/enums/laundry-item-category.enum'

export interface LaundryItemDto {
  id: string
  slug: string
  name: string
  category: LaundryItemCategory
  price: number
  isActive: boolean
  createdAt: string | null
}

export interface LaundryItemsListDto {
  items: LaundryItemDto[]
}

export interface LaundryItemsAdminAllParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  category?: LaundryItemCategory
  isActive?: boolean
  sortBy?: 'name' | 'category' | 'price' | 'createdAt'
  sortDirection?: 'asc' | 'desc'
}

export interface CreateLaundryItemRequestDto {
  name: string
  category: LaundryItemCategory
  price: number
}

export interface UpdateLaundryItemRequestDto {
  name: string
  category: LaundryItemCategory
  price: number
}

export interface ToggleLaundryItemsActiveRequestDto {
  laundryItemIds: string[]
}

export interface DeleteLaundryItemsRequestDto {
  laundryItemIds: string[]
}

export interface LaundryItemCatalogDto {
  id: string
  name: string
  category: LaundryItemCategory
  price: number
}
