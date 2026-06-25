export const OperationalBagSystemStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type OperationalBagSystemStatus =
  (typeof OperationalBagSystemStatus)[keyof typeof OperationalBagSystemStatus]

export const OPERATIONAL_BAG_SYSTEM_STATUSES = Object.values(OperationalBagSystemStatus)

export const OperationalBagStatus = {
  Ready: 'ready',
  Processing: 'processing',
  OnTheWay: 'on_the_way',
  Assigned: 'assigned',
  InTransit: 'in_transit',
  Missing: 'missing',
} as const

export type OperationalBagStatus =
  (typeof OperationalBagStatus)[keyof typeof OperationalBagStatus]

export const OPERATIONAL_BAG_STATUSES = Object.values(OperationalBagStatus)
