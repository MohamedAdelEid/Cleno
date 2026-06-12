import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768

const getSnapshot = (): boolean => window.innerWidth < MOBILE_BREAKPOINT

const subscribe = (onStoreChange: () => void): (() => void) => {
  const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mediaQuery.addEventListener('change', onStoreChange)
  return () => mediaQuery.removeEventListener('change', onStoreChange)
}

export const useIsMobile = (): boolean => useSyncExternalStore(subscribe, getSnapshot)
