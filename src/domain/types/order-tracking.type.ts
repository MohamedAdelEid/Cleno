import type { OrderStatus } from '@/domain/enums'

export type ShipmentStepState = 'completed' | 'active' | 'upcoming'

export interface ShipmentTimelineStep {
  status: OrderStatus
  state: ShipmentStepState
  at: string
}

export interface ActiveShipment {
  orderNumber: string
  status: OrderStatus
  destinationLabel: string
  mapUrl: string
  steps: ShipmentTimelineStep[]
}
