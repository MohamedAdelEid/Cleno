import { motion } from 'framer-motion'
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type { Language } from '@/domain/enums'
import { useLanguageStore } from '@/presentation/store'

const FADE_OUT_S = 0.18
const FADE_IN_S = 0.32
const EASE = [0.4, 0, 0.2, 1] as const

type TransitionPhase = 'idle' | 'fade-out' | 'fade-in'

interface LocaleTransitionState {
  isTransitioning: boolean
  startLocaleTransition: (language: Language) => void
}

const LocaleTransitionContext = createContext<LocaleTransitionState | null>(null)

export const useLocaleTransition = (): LocaleTransitionState => {
  const context = useContext(LocaleTransitionContext)

  if (!context) {
    throw new Error('useLocaleTransition must be used within LocaleTransitionProvider')
  }

  return context
}

interface LocaleTransitionProviderProps {
  children: ReactNode
}

export const LocaleTransitionProvider = ({ children }: LocaleTransitionProviderProps) => {
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const pendingLanguageRef = useRef<Language | null>(null)

  const startLocaleTransition = useCallback(
    (language: Language) => {
      if (phase !== 'idle') return
      pendingLanguageRef.current = language
      setPhase('fade-out')
    },
    [phase],
  )

  const handleAnimationComplete = useCallback(() => {
    if (phase === 'fade-out') {
      if (pendingLanguageRef.current) {
        setLanguage(pendingLanguageRef.current)
        pendingLanguageRef.current = null
      }
      setPhase('fade-in')
      return
    }

    if (phase === 'fade-in') {
      setPhase('idle')
    }
  }, [phase, setLanguage])

  const isTransitioning = phase !== 'idle'

  return (
    <LocaleTransitionContext.Provider value={{ isTransitioning, startLocaleTransition }}>
      <motion.div
        initial={false}
        animate={phase === 'fade-out' ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
        transition={{
          duration: phase === 'fade-out' ? FADE_OUT_S : FADE_IN_S,
          ease: EASE,
        }}
        onAnimationComplete={handleAnimationComplete}
        className="h-dvh max-h-dvh overflow-hidden"
        style={{ willChange: isTransitioning ? 'opacity, transform' : 'auto' }}
      >
        {children}
      </motion.div>
    </LocaleTransitionContext.Provider>
  )
}
