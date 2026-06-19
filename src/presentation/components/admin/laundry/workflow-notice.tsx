import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface WorkflowNoticeProps {
  message: string
}

export const WorkflowNotice = ({ message }: WorkflowNoticeProps) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.38 }}
    className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20"
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
      <AlertTriangle className="size-4 text-amber-700 dark:text-amber-400" strokeWidth={2} />
    </span>
    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{message}</p>
  </motion.div>
)
