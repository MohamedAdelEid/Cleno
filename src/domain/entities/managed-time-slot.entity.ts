export interface ManagedTimeSlot {
  id: string
  slug: string
  startTime: string
  endTime: string
  label: string
  isActive: boolean
  displayOrder: number
}

export interface ManagedTimeSlotStats {
  totalSlots: number
  activeSlots: number
  inactiveSlots: number
}

export interface ManagedTimeSlotStatTrends {
  totalSlots: number[]
  activeSlots: number[]
  inactiveSlots: number[]
}
