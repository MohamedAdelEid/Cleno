export const OrderStatus = {
  OrderCreated: 1,
  PickedUp: 2,
  InLaundry: 3,
  ReadyForDelivery: 4,
  Delivered: 5,
  Cancelled: 6,
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const ORDER_STATUSES = Object.values(OrderStatus) as OrderStatus[]

export const parseOrderStatus = (value: number): OrderStatus =>
  ORDER_STATUSES.includes(value as OrderStatus) ? (value as OrderStatus) : OrderStatus.OrderCreated

export const isTerminalOrderStatus = (status: OrderStatus): boolean =>
  status === OrderStatus.Delivered || status === OrderStatus.Cancelled
