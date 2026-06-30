import { z } from 'zod'

import { OperationalBagStatus, OperationalBagSystemStatus } from '@/domain/enums'

export const createOperationalBagFormSchema = (messages: {
  bagIdRequired: string
  bagIdMin: string
  bagIdMax: string
  bagIdFormat: string
  weightPositive: string
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
    notes: z.string().trim().max(500).optional(),
    weight: z.number().positive(messages.weightPositive).nullable().optional(),
    systemStatus: z.enum([OperationalBagSystemStatus.Active, OperationalBagSystemStatus.Inactive]),
    operationalStatus: z.enum([
      OperationalBagStatus.Ready,
      OperationalBagStatus.Assigned,
      OperationalBagStatus.Processing,
      OperationalBagStatus.OnTheWay,
      OperationalBagStatus.InTransit,
      OperationalBagStatus.Missing,
    ]),
  })

export type OperationalBagFormValues = z.infer<ReturnType<typeof createOperationalBagFormSchema>>

export const emptyOperationalBagFormValues: OperationalBagFormValues = {
  bagId: '',
  notes: '',
  weight: null,
  systemStatus: OperationalBagSystemStatus.Active,
  operationalStatus: OperationalBagStatus.Ready,
}
