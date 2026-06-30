import { timeSlotAdapter } from '@/application/adapters/time-slot.adapter'
import type {
  CreateTimeSlotRequestDto,
  TimeSlotDto,
  TimeSlotForEditDto,
  TimeSlotsAllParams,
  ToggleTimeSlotsActiveRequestDto,
  UpdateTimeSlotRequestDto,
} from '@/application/dtos/time-slots/time-slots-admin.dto'
import type { ManagedTimeSlot } from '@/domain/entities'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export const timeSlotsApi = {
  async getAll(params: TimeSlotsAllParams = {}): Promise<ApiResult<ManagedTimeSlot[]>> {
    const result = await httpClient.get<TimeSlotDto[]>({
      url: API_ENDPOINTS.timeSlots.all,
      params: timeSlotAdapter.toAllParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: timeSlotAdapter.toManagedTimeSlots(result.data),
    }
  },

  async getForEdit(slug: string): Promise<ApiResult<TimeSlotForEditDto>> {
    return httpClient.get<TimeSlotForEditDto>({
      url: API_ENDPOINTS.timeSlots.forEdit(slug),
    })
  },

  create(payload: CreateTimeSlotRequestDto): Promise<ApiResult<string>> {
    return httpClient.post<string>({
      url: API_ENDPOINTS.timeSlots.create,
      data: payload,
    })
  },

  update(slug: string, payload: UpdateTimeSlotRequestDto): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.timeSlots.update(slug),
      data: payload,
    })
  },

  toggleActive(timeSlotIds: string[]): Promise<ApiResult<boolean>> {
    const payload: ToggleTimeSlotsActiveRequestDto = { timeSlotIds }
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.timeSlots.toggleActive,
      data: payload,
    })
  },
}
