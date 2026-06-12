import { type ReactNode } from 'react'
import { Language } from '@/domain/enums'
import { i18n } from '@/infrastructure/libs/i18n/i18n'
import { ToastProvider } from '@/presentation/components/feedback/toast'
import { TooltipProvider } from '@/presentation/components/ui/tooltip'
import { resources } from '@/presentation/i18n'
import { useLanguageStore } from '@/presentation/store'
import { AuthProvider } from './auth-provider'
import { LocaleTransitionProvider } from './locale-transition-provider'
import { ThemeProvider } from './theme-provider'

const initialLanguage = useLanguageStore.getState().language
i18n.init(resources, initialLanguage)
document.documentElement.lang = initialLanguage
document.documentElement.dir = initialLanguage === Language.Arabic ? 'rtl' : 'ltr'

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ThemeProvider>
      <LocaleTransitionProvider>
        <AuthProvider>
          <TooltipProvider>
            {children}
            <ToastProvider />
          </TooltipProvider>
        </AuthProvider>
      </LocaleTransitionProvider>
    </ThemeProvider>
  )
}
