export const OrderStatus = {
  OrderCreated: 'order_created',
  OnTheWayToLaundry: 'on_the_way_to_laundry',
  InLaundry: 'in_laundry',
  ReadyForDelivery: 'ready_for_delivery',
  Delivered: 'delivered',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const ORDER_STATUSES = Object.values(OrderStatus)
