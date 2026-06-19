export const PAGE_EASE = [0.25, 0.1, 0.25, 1] as const

export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: PAGE_EASE, delay },
})
