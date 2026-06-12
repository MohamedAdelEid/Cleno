import type { ReactNode } from 'react'

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface NotifyOptions {
  title: string
  description?: ReactNode
  duration?: number | null
  position?: ToastPosition
}

export interface NotifyPromiseMessages<T> {
  loading: NotifyOptions
  success: NotifyOptions | ((data: T) => NotifyOptions)
  error: NotifyOptions | ((error: unknown) => NotifyOptions)
}
