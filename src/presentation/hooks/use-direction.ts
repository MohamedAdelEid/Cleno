import { Language } from '@/domain/enums'
import { useLanguageStore } from '@/presentation/store'

export const useDirection = () => {
  const language = useLanguageStore((state) => state.language)
  const isRtl = language === Language.Arabic

  return {
    language,
    isRtl,
    dir: isRtl ? ('rtl' as const) : ('ltr' as const),
    sidebarSide: isRtl ? ('right' as const) : ('left' as const),
  }
}
