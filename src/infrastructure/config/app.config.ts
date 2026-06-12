import { env } from './env'
import { DEFAULT_LANGUAGE, DEFAULT_PAGE_SIZE } from './constants'
import { SUPPORTED_LANGUAGES } from '@/domain/enums'

export const appConfig = {
  name: env.appName,
  api: {
    baseUrl: env.apiBaseUrl,
    timeout: env.apiTimeout,
  },
  i18n: {
    defaultLanguage: DEFAULT_LANGUAGE,
    supportedLanguages: SUPPORTED_LANGUAGES,
  },
  pagination: {
    defaultPageSize: DEFAULT_PAGE_SIZE,
  },
} as const
