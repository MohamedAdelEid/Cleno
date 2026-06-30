export const DriverAvailability = {
  Available: 1,
  Unavailable: 2,
} as const

export type DriverAvailability =
  (typeof DriverAvailability)[keyof typeof DriverAvailability]
