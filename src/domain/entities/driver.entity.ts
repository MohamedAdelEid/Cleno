import type { DriverStatus } from '@/domain/enums'

export interface ActiveDriver {
  id: string
  fullName: string
  avatarUrl: string | null
  status: DriverStatus
  activeTask: string | null
  taskCount?: number
}
