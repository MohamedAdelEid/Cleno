import { OrderStatus } from '@/domain/enums'
import type { ActiveShipment } from '@/domain/types'

export const activeShipment: ActiveShipment = {
  orderNumber: 'ORD-2835-800NYK',
  status: OrderStatus.InLaundry,
  destinationLabel: 'Downtown Branch',
  mapUrl: 'https://maps.app.goo.gl/BEhEcuUU69cD8gb77',
  steps: [
    {
      status: OrderStatus.OrderCreated,
      state: 'completed',
      at: '2026-06-13T06:21:00.000Z',
    },
    {
      status: OrderStatus.OnTheWayToLaundry,
      state: 'completed',
      at: '2026-06-13T08:15:00.000Z',
    },
    {
      status: OrderStatus.InLaundry,
      state: 'active',
      at: '2026-06-13T09:40:00.000Z',
    },
    {
      status: OrderStatus.ReadyForDelivery,
      state: 'upcoming',
      at: '2026-06-14T11:00:00.000Z',
    },
    {
      status: OrderStatus.Delivered,
      state: 'upcoming',
      at: '2026-06-14T14:30:00.000Z',
    },
  ],
}
