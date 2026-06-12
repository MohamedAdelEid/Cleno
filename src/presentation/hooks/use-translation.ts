import { useCallback } from 'react'
import { i18n } from '@/infrastructure/libs/i18n/i18n'
import type { Namespace } from '@/infrastructure/libs/i18n/namespaces'
import { useLanguageStore } from '@/presentation/store'

export const useTranslation = (namespace: Namespace) => {
  const language = useLanguageStore((state) => state.language)

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      void language
      return i18n.t(namespace, key, params)
    },
    [namespace, language],
  )

  return { t, language }
}
