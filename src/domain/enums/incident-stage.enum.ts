export const IncidentStage = {
  Incoming: 1,
  InLaundry: 2,
  ReadyForDelivery: 3,
} as const

export type IncidentStage = (typeof IncidentStage)[keyof typeof IncidentStage]
