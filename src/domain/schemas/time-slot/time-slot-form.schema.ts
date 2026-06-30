import { z } from 'zod'

export const createTimeSlotFormSchema = (messages: {
  startTimeRequired: string
  endTimeRequired: string
  endAfterStart: string
  displayOrderMin: string
}) =>
  z
    .object({
      startTime: z.string().trim().min(1, messages.startTimeRequired),
      endTime: z.string().trim().min(1, messages.endTimeRequired),
      displayOrder: z.number().int().min(0, messages.displayOrderMin),
    })
    .superRefine((values, ctx) => {
      if (!values.startTime || !values.endTime) return

      const start = values.startTime.padEnd(8, ':00')
      const end = values.endTime.padEnd(8, ':00')

      if (end <= start) {
        ctx.addIssue({
          code: 'custom',
          message: messages.endAfterStart,
          path: ['endTime'],
        })
      }
    })

export type TimeSlotFormValues = z.infer<ReturnType<typeof createTimeSlotFormSchema>>

export const emptyTimeSlotFormValues: TimeSlotFormValues = {
  startTime: '',
  endTime: '',
  displayOrder: 1,
}
