import type { DriverAvailability } from '@/domain/enums/driver-availability.enum'

export interface ManagedDriver {
  id: string
  slug: string
  fullName: string
  email: string
  phone: string
  photoUrl: string | null
  photoPath: string | null
  status: DriverAvailability
  ordersCount: number
  createdAt: string | null
}

export interface ManagedDriverStats {
  totalDrivers: number
  availableDrivers: number
  unavailableDrivers: number
}

export interface ManagedDriverStatTrends {
  totalDrivers: number[]
  availableDrivers: number[]
  unavailableDrivers: number[]
}
