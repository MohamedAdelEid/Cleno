import { motion } from 'framer-motion'
import { Check, ScanLine } from 'lucide-react'

import type { LaundryBag, LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { Button } from '@/presentation/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

interface ScanVerifyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: LaundryOrder | null
  verifiedBags: Set<string>
  onVerifyBag: (bagId: string) => void
  onConfirm: () => void
}

export const ScanVerifyModal = ({
  open,
  onOpenChange,
  order,
  verifiedBags,
  onVerifyBag,
  onConfirm,
}: ScanVerifyModalProps) => {
  const { t } = useTranslation('laundry')

  if (!order) return null

  const allVerified = order.pickupBags.every((bag) => verifiedBags.has(bag.id))
  const subtitle = t('scanVerifySubtitle')
    .replace('{{orderNumber}}', order.orderNumber)
    .replace('{{count}}', String(order.pickupBags.length))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="size-5 text-primary" strokeWidth={2} />
            {t('scanVerifyTitle')}
          </DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {order.pickupBags.map((bag, index) => (
            <BagVerifyItem
              key={bag.id}
              bag={bag}
              index={index}
              isVerified={verifiedBags.has(bag.id)}
              onVerify={() => onVerifyBag(bag.id)}
            />
          ))}
        </div>

        {allVerified && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            {t('allVerified')}
          </motion.p>
        )}

        <DialogFooter>
          <Button onClick={onConfirm} disabled={!allVerified} className="w-full">
            {allVerified ? t('allVerified') : t('verifyRequired')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface BagVerifyItemProps {
  bag: LaundryBag
  index: number
  isVerified: boolean
  onVerify: () => void
}

const BagVerifyItem = ({ bag, index, isVerified, onVerify }: BagVerifyItemProps) => {
  const { t } = useTranslation('laundry')

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={isVerified ? undefined : onVerify}
      disabled={isVerified}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border px-4 py-3 transition-all',
        isVerified
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20'
          : 'border-border/70 bg-background hover:border-primary/40 hover:bg-muted/30 cursor-pointer',
      )}
    >
      <span className="font-mono text-sm font-medium text-foreground">{bag.bagId}</span>
      {isVerified ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
        >
          <Check className="size-4" strokeWidth={2.5} />
          {t('verified')}
        </motion.span>
      ) : (
        <span className="text-xs text-muted-foreground">{t('tapToVerify')}</span>
      )}
    </motion.button>
  )
}
