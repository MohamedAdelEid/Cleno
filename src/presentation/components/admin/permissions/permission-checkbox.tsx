import { motion } from 'framer-motion'

import { Checkbox } from '@/presentation/components/ui/checkbox'
import { cn } from '@/presentation/utils'

const CHECK_EASE = [0.25, 0.1, 0.25, 1] as const

interface PermissionCheckboxProps {
  id: string
  label: string
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  index?: number
}

export const PermissionCheckbox = ({
  id,
  label,
  checked,
  disabled = false,
  onCheckedChange,
  index = 0,
}: PermissionCheckboxProps) => (
  <motion.label
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: CHECK_EASE, delay: index * 0.025 }}
    className={cn(
      'flex items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-foreground',
      !disabled && 'cursor-pointer hover:bg-muted/40',
      disabled && 'cursor-default',
    )}
  >
    <Checkbox
      checked={checked}
      disabled={disabled}
      onCheckedChange={(value) => onCheckedChange?.(value === true)}
    />
    <span>{label}</span>
    <span className="sr-only">{id}</span>
  </motion.label>
)
