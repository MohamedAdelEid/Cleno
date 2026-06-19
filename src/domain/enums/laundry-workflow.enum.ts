export const LaundryWorkflowStage = {
  IncomingToLaundry: 'incoming_to_laundry',
  InLaundry: 'in_laundry',
  ReadyForDelivery: 'ready_for_delivery',
} as const

export type LaundryWorkflowStage =
  (typeof LaundryWorkflowStage)[keyof typeof LaundryWorkflowStage]

export const LAUNDRY_WORKFLOW_STAGES = Object.values(LaundryWorkflowStage)

export const BagStatus = {
  OnTheWay: 'on_the_way',
  Processing: 'processing',
  Ready: 'ready',
} as const

export type BagStatus = (typeof BagStatus)[keyof typeof BagStatus]

export const UrgencyLevel = {
  Normal: 'normal',
  Warning: 'warning',
  Urgent: 'urgent',
  Overdue: 'overdue',
} as const

export type UrgencyLevel = (typeof UrgencyLevel)[keyof typeof UrgencyLevel]
