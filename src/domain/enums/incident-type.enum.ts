export const IncidentType = {
  DamagedBag: 1,
  WrongItems: 2,
  MissingItems: 3,
  Delay: 4,
  Other: 5,
} as const

export type IncidentType = (typeof IncidentType)[keyof typeof IncidentType]
