import { format } from 'date-fns'
import type { Locale } from 'date-fns'

export const apiTimeToInput = (time: string): string => {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

export const inputTimeToApi = (time: string): string => {
  const parts = time.split(':')
  if (parts.length >= 3) return time
  return `${time}:00`
}

export const formatTimeOnly = (time: string, locale?: Locale): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, hours, minutes)
  return format(date, 'h:mm a', { locale })
}
