export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const prefersDark = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches

export const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') return prefersDark() ? 'dark' : 'light'
  return theme
}

export const applyTheme = (theme: Theme): ResolvedTheme => {
  const resolved = resolveTheme(theme)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  return resolved
}
