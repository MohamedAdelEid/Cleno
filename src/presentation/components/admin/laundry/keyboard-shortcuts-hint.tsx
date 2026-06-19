import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useEffect, useState } from 'react'
import { Keyboard } from 'lucide-react'

import { cn } from '@/presentation/utils'

const PANEL_SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const

export interface KeyboardShortcut {
  keys: string[]
  description: string
}

interface KeyboardShortcutsHintProps {
  shortcuts: KeyboardShortcut[]
  hintLabel: string
}

export const KeyboardShortcutsHint = ({ shortcuts, hintLabel }: KeyboardShortcutsHintProps) => {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [expanded])

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end">
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="shortcuts-panel"
            role="dialog"
            aria-label={hintLabel}
            initial={{ opacity: 0, y: 16, scale: 0.94, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.97, filter: 'blur(3px)' }}
            transition={PANEL_SPRING}
            className="mb-2 w-72 origin-bottom-right overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-2xl backdrop-blur-md rtl:origin-bottom-left"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } },
              }}
              className="divide-y divide-border/40 p-1.5"
            >
              {shortcuts.map((shortcut) => (
                <motion.li
                  key={shortcut.keys.join('-')}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
                  }}
                  className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2"
                >
                  <span className="text-xs leading-snug text-muted-foreground">
                    {shortcut.description}
                  </span>
                  <ShortcutKeys keys={shortcut.keys} />
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        layout
        onClick={() => setExpanded((prev) => !prev)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-border/70 bg-background/95 px-3 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-muted/40 hover:text-foreground',
          expanded && 'border-primary/30 text-foreground',
        )}
      >
        <motion.span
          animate={{ rotate: expanded ? -12 : 0, scale: expanded ? 1.08 : 1 }}
          transition={PANEL_SPRING}
        >
          <Keyboard className="size-3.5" strokeWidth={2} />
        </motion.span>
        {hintLabel}
      </motion.button>
    </div>
  )
}

const ShortcutKeys = ({ keys }: { keys: string[] }) => (
  <div className="flex shrink-0 items-center gap-1">
    {keys.map((key, index) => (
      <Fragment key={`${key}-${index}`}>
        {index > 0 && (
          <span className="px-0.5 text-[10px] font-medium text-muted-foreground/50">+</span>
        )}
        <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border/80 bg-muted/60 px-1.5 font-sans text-[10px] font-semibold text-foreground shadow-xs">
          {key}
        </kbd>
      </Fragment>
    ))}
  </div>
)
