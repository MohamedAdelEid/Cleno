import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/presentation/utils'

interface ScrollHintProps {
  className?: string
}

export const ScrollHint = ({ className }: ScrollHintProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      'pointer-events-none absolute inset-x-0 bottom-1 z-10 flex justify-center',
      className,
    )}
  >
    <motion.div
      animate={{ y: [0, 3, 0] }}
      transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
      className="flex size-5 items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground/70 backdrop-blur-sm"
    >
      <ChevronDown className="size-3" strokeWidth={2} />
    </motion.div>
  </motion.div>
)
