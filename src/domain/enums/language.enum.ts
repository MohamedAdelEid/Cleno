export const Language = {
  English: 'en',
  Arabic: 'ar',
} as const

export type Language = (typeof Language)[keyof typeof Language]

export const SUPPORTED_LANGUAGES = Object.values(Language)
