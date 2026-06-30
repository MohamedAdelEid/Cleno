export const LaundryItemCategory = {
  Wash: 1,
  Iron: 2,
  WashAndIron: 3,
} as const

export type LaundryItemCategory =
  (typeof LaundryItemCategory)[keyof typeof LaundryItemCategory]
