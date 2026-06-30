import { z } from 'zod'

import { LaundryItemCategory } from '@/domain/enums/laundry-item-category.enum'

export const createLaundryItemFormSchema = (messages: {
  nameRequired: string
  nameMax: string
  priceMin: string
}) =>
  z.object({
    name: z.string().trim().min(1, messages.nameRequired).max(200, messages.nameMax),
    category: z.union([
      z.literal(LaundryItemCategory.Wash),
      z.literal(LaundryItemCategory.Iron),
      z.literal(LaundryItemCategory.WashAndIron),
    ]),
    price: z.number().positive(messages.priceMin),
  })

export type LaundryItemFormValues = z.infer<ReturnType<typeof createLaundryItemFormSchema>>

export const emptyLaundryItemFormValues: LaundryItemFormValues = {
  name: '',
  category: LaundryItemCategory.Wash,
  price: 0,
}
