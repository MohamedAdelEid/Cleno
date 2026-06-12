import { Toaster } from 'sileo'
import { useEffect, useMemo, useState } from 'react'
import 'sileo/styles.css'

import { getSileoToasterOptions } from '@/infrastructure/libs/toast/sileo.toast.theme'
import { getToastPosition } from '@/infrastructure/libs/toast/toast.position'
import { setToastPositionResolver } from '@/infrastructure/libs/toast/toast'
import { useThemeStore } from '@/presentation/store'
import type { Theme } from '@/infrastructure/libs/theme/theme'
import '@/presentation/styles/toast.css'

const resolveThemeMode = (theme: Theme, systemDark: boolean): 'light' | 'dark' => {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return systemDark ? 'dark' : 'light'
}

export const ToastProvider = () => {
  const theme = useThemeStore((state) => state.theme)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  const position = useMemo(() => getToastPosition(), [])
  const mode = useMemo(
    () => resolveThemeMode(theme, systemDark),
    [theme, systemDark],
  )
  const toasterOptions = useMemo(() => getSileoToasterOptions(mode), [mode])

  useEffect(() => {
    setToastPositionResolver(getToastPosition)
    return () => setToastPositionResolver(null)
  }, [])

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setSystemDark(media.matches)

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <Toaster
      position={position}
      theme={theme}
      offset={{ top: 20 }}
      options={toasterOptions}
    />
  )
}
