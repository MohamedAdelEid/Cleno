import type { LaundryItemCategory } from '@/domain/enums/laundry-item-category.enum'

export interface ManagedLaundryItem {
  id: string
  slug: string
  name: string
  category: LaundryItemCategory
  price: number
  isActive: boolean
  createdAt: string | null
}

export interface ManagedLaundryItemStats {
  totalItems: number
  activeItems: number
  inactiveItems: number
}

export interface ManagedLaundryItemStatTrends {
  totalItems: number[]
  activeItems: number[]
  inactiveItems: number[]
}
