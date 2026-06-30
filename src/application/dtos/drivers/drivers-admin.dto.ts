import type { FileReferenceDto } from '@/application/dtos/file-upload/file-upload.dto'

export interface DriverDto {
  id: string
  slug: string
  fullName: string
  email: string
  phone: string
  photo: FileReferenceDto | null
  status: number
  ordersCount: number
  createdAt: string | null
}

export interface DriversListDto {
  items: DriverDto[]
}

export interface DriversAdminAllParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  status?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface CreateDriverRequestDto {
  fullName: string
  email: string
  phone: string
  password: string
  photo?: string | null
  status?: number
}

export interface UpdateDriverRequestDto {
  fullName: string
  email: string
  phone: string
  photo?: string | null
  status?: number
}

export interface DriverDropdownItemDto {
  id: string
  slug: string
  fullName: string
  email: string
  status: number
}
