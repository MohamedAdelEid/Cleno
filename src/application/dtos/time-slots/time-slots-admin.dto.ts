export interface TimeSlotDto {
  id: string
  slug: string
  startTime: string
  endTime: string
  label: string
  isActive: boolean
  displayOrder: number
}

export interface TimeSlotForEditDto {
  id: string
  slug: string
  startTime: string
  endTime: string
  displayOrder: number
  isActive: boolean
}

export interface TimeSlotsAllParams {
  activeOnly?: boolean
}

export interface CreateTimeSlotRequestDto {
  startTime: string
  endTime: string
  displayOrder: number
}

export interface UpdateTimeSlotRequestDto {
  startTime: string
  endTime: string
  displayOrder: number
}

export interface ToggleTimeSlotsActiveRequestDto {
  timeSlotIds: string[]
}
