import { sileo } from 'sileo'

import type { ToastAdapter } from './toast.adapter'
import type { NotifyOptions, NotifyPromiseMessages } from './toast.types'

const toSileoOptions = (options: NotifyOptions) => ({
  title: options.title,
  description: options.description,
  duration: options.duration ?? undefined,
  position: options.position,
})

export const sileoToastAdapter: ToastAdapter = {
  success: (options) => sileo.success(toSileoOptions(options)),
  error: (options) => sileo.error(toSileoOptions(options)),
  warning: (options) => sileo.warning(toSileoOptions(options)),
  info: (options) => sileo.info(toSileoOptions(options)),

  promise: <T>(promise: Promise<T>, messages: NotifyPromiseMessages<T>) =>
    sileo.promise(promise, {
      loading: toSileoOptions(messages.loading),
      success: (data) =>
        toSileoOptions(
          typeof messages.success === 'function' ? messages.success(data) : messages.success,
        ),
      error: (error) =>
        toSileoOptions(
          typeof messages.error === 'function' ? messages.error(error) : messages.error,
        ),
    }),

  dismiss: (id) => sileo.dismiss(id),
  clear: () => sileo.clear(),
}
