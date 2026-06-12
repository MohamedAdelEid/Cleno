import type { NotifyOptions, NotifyPromiseMessages } from './toast.types'

export interface ToastAdapter {
  success: (options: NotifyOptions) => string
  error: (options: NotifyOptions) => string
  warning: (options: NotifyOptions) => string
  info: (options: NotifyOptions) => string
  promise: <T>(promise: Promise<T>, messages: NotifyPromiseMessages<T>) => Promise<T>
  dismiss: (id: string) => void
  clear: () => void
}
