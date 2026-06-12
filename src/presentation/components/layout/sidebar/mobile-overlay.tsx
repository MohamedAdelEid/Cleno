import { motion } from 'framer-motion'

interface MobileOverlayProps {
  onClick: () => void
}

export const MobileOverlay = ({ onClick }: MobileOverlayProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
    onClick={onClick}
  />
)
