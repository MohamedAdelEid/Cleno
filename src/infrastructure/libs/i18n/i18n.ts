import type { Language } from '@/domain/enums'
import { DEFAULT_LANGUAGE } from '@/infrastructure/config/constants'
import type { Namespace } from './namespaces'

type NamespaceTree = Record<string, string>
type LanguageResources = Partial<Record<Namespace, NamespaceTree>>
export type I18nResources = Partial<Record<Language, LanguageResources>>

let resources: I18nResources = {}
let currentLanguage: Language = DEFAULT_LANGUAGE

const interpolate = (template: string, params?: Record<string, string | number>): string => {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(params[key] ?? `{{${key}}}`))
}

export const i18n = {
  init(initialResources: I18nResources, language: Language = DEFAULT_LANGUAGE): void {
    resources = initialResources
    currentLanguage = language
  },

  changeLanguage(language: Language): void {
    currentLanguage = language
  },

  get language(): Language {
    return currentLanguage
  },

  t(namespace: Namespace, key: string, params?: Record<string, string | number>): string {
    const value = resources[currentLanguage]?.[namespace]?.[key]
    return value ? interpolate(value, params) : key
  },
}
