import { Language } from '@/domain/enums'
import type { I18nResources } from '@/infrastructure/libs/i18n/i18n'
import { ar } from './ar'
import { en } from './en'

export const resources: I18nResources = {
  [Language.English]: en,
  [Language.Arabic]: ar,
}
