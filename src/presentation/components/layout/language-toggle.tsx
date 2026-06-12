import { Language } from '@/domain/enums'
import { useLocaleTransition } from '@/presentation/providers/locale-transition-provider'
import { useLanguageStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'

export const LanguageToggle = () => {
  const language = useLanguageStore((state) => state.language)
  const { startLocaleTransition, isTransitioning } = useLocaleTransition()

  const setActiveLanguage = (next: Language) => {
    if (isTransitioning || language === next) return
    startLocaleTransition(next)
  }

  return (
    <div
      className={cn(
        'flex h-9 items-center gap-1 rounded-lg border p-1 transition-opacity duration-200',
        isTransitioning && 'pointer-events-none opacity-70',
      )}
    >
      <button
        type="button"
        onClick={() => setActiveLanguage(Language.English)}
        disabled={isTransitioning}
        className={cn(
          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
          language === Language.English
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setActiveLanguage(Language.Arabic)}
        disabled={isTransitioning}
        className={cn(
          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
          language === Language.Arabic
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        AR
      </button>
    </div>
  )
}
