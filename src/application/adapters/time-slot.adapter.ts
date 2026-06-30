import type {
  CreateTimeSlotRequestDto,
  TimeSlotDto,
  TimeSlotForEditDto,
  TimeSlotsAllParams,
  UpdateTimeSlotRequestDto,
} from '@/application/dtos/time-slots/time-slots-admin.dto'
import type { ManagedTimeSlot } from '@/domain/entities'
import type { TimeSlotFormValues } from '@/domain/schemas'
import { inputTimeToApi } from '@/infrastructure/utils/time-only.utils'

const toManagedTimeSlot = (dto: TimeSlotDto): ManagedTimeSlot => ({
  id: dto.id,
  slug: dto.slug,
  startTime: dto.startTime,
  endTime: dto.endTime,
  label: dto.label,
  isActive: dto.isActive,
  displayOrder: dto.displayOrder,
})

const toFormPayload = (values: TimeSlotFormValues) => ({
  startTime: inputTimeToApi(values.startTime),
  endTime: inputTimeToApi(values.endTime),
  displayOrder: values.displayOrder,
})

export const timeSlotAdapter = {
  toManagedTimeSlots(items: TimeSlotDto[]): ManagedTimeSlot[] {
    return items.map(toManagedTimeSlot)
  },

  toManagedTimeSlot(dto: TimeSlotDto): ManagedTimeSlot {
    return toManagedTimeSlot(dto)
  },

  toCreateRequest(values: TimeSlotFormValues): CreateTimeSlotRequestDto {
    return toFormPayload(values)
  },

  toUpdateRequest(values: TimeSlotFormValues): UpdateTimeSlotRequestDto {
    return toFormPayload(values)
  },

  toAllParams(params: TimeSlotsAllParams): Record<string, unknown> {
    const query: Record<string, unknown> = {}
    if (params.activeOnly != null) query.activeOnly = params.activeOnly
    return query
  },

  forEditToFormValues(dto: TimeSlotForEditDto): TimeSlotFormValues {
    const [startHours, startMinutes] = dto.startTime.split(':')
    const [endHours, endMinutes] = dto.endTime.split(':')

    return {
      startTime: `${startHours}:${startMinutes}`,
      endTime: `${endHours}:${endMinutes}`,
      displayOrder: dto.displayOrder,
    }
  },
}
