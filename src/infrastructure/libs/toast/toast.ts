import type { ToastAdapter } from './toast.adapter'
import { sileoToastAdapter } from './sileo.toast.adapter'
import type { NotifyOptions, NotifyPromiseMessages, ToastPosition } from './toast.types'

let activeAdapter: ToastAdapter = sileoToastAdapter
let resolvePosition: (() => ToastPosition) | null = null

export const setToastPositionResolver = (resolver: (() => ToastPosition) | null): void => {
  resolvePosition = resolver
}

const withDefaults = (options: NotifyOptions): NotifyOptions => ({
  ...options,
  position: options.position ?? resolvePosition?.(),
})

/** Swap the toast implementation without touching call sites. */
export const setToastAdapter = (adapter: ToastAdapter): void => {
  activeAdapter = adapter
}

export const getToastAdapter = (): ToastAdapter => activeAdapter

export const notify = {
  success: (options: NotifyOptions): string => activeAdapter.success(withDefaults(options)),
  error: (options: NotifyOptions): string => activeAdapter.error(withDefaults(options)),
  warning: (options: NotifyOptions): string => activeAdapter.warning(withDefaults(options)),
  info: (options: NotifyOptions): string => activeAdapter.info(withDefaults(options)),

  promise<T>(promise: Promise<T>, messages: NotifyPromiseMessages<T>): Promise<T> {
    return activeAdapter.promise(promise, messages)
  },

  dismiss: (id: string): void => activeAdapter.dismiss(id),
  clear: (): void => activeAdapter.clear(),
}
