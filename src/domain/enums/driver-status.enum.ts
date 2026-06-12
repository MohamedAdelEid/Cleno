export const DriverStatus = {
  Idle: 'idle',
  OnTask: 'on_task',
} as const

export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus]
