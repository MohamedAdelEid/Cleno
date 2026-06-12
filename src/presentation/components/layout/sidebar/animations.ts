import type { Variants } from 'framer-motion'

export const SIDEBAR_WIDTH_EXPANDED = 280
export const SIDEBAR_WIDTH_COLLAPSED = 80
export const SIDEBAR_WIDTH_MOBILE = 300
export const SIDEBAR_DURATION = 0.45
export const SIDEBAR_EASE = [0.25, 0.1, 0.25, 1] as const

export const createSidebarVariants = (isRtl: boolean): Variants => ({
  initial: {
    width: SIDEBAR_WIDTH_EXPANDED,
    x: isRtl ? 80 : -80,
    opacity: 0,
  },
  expanded: {
    width: SIDEBAR_WIDTH_EXPANDED,
    x: 0,
    opacity: 1,
    transition: { duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE },
  },
  collapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    x: 0,
    opacity: 1,
    transition: { duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE },
  },
})

export const createMobileSidebarVariants = (isRtl: boolean): Variants => ({
  hidden: {
    width: SIDEBAR_WIDTH_MOBILE,
    x: isRtl ? SIDEBAR_WIDTH_MOBILE : -SIDEBAR_WIDTH_MOBILE,
    opacity: 0.5,
  },
  visible: {
    width: SIDEBAR_WIDTH_MOBILE,
    x: 0,
    opacity: 1,
  },
})

export const createItemVariants = (isRtl: boolean): Variants => ({
  hidden: { opacity: 0, x: isRtl ? 20 : -20 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.03, duration: 0.25, ease: 'easeOut' },
  }),
})

export const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
}

export const textVariants: Variants = {
  hidden: { opacity: 0, width: 0 },
  visible: { opacity: 1, width: 'auto', transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, width: 0, transition: { duration: 0.25, ease: 'easeIn' } },
}
