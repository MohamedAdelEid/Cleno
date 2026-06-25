import { z } from 'zod'

import { OperationalBagSystemStatus } from '@/domain/enums'

export const createOperationalBagFormSchema = (messages: {
  bagIdRequired: string
  bagIdMin: string
  bagIdMax: string
  bagIdFormat: string
}) =>
  z.object({
    bagId: z
      .string()
      .trim()
      .min(1, messages.bagIdRequired)
      .min(3, messages.bagIdMin)
      .max(32, messages.bagIdMax)
      .regex(/^BAG-\d{3,}$/i, messages.bagIdFormat)
      .transform((value) => value.toUpperCase()),
    systemStatus: z.enum([
      OperationalBagSystemStatus.Active,
      OperationalBagSystemStatus.Inactive,
    ]),
  })

export type OperationalBagFormValues = z.infer<
  ReturnType<typeof createOperationalBagFormSchema>
>

export const emptyOperationalBagFormValues: OperationalBagFormValues = {
  bagId: '',
  systemStatus: OperationalBagSystemStatus.Active,
}
