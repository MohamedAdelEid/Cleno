import { motion } from 'framer-motion'
import { Check, Truck, Wand2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { LaundryDriver, LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { SearchInput } from '@/presentation/components/ui/search-input'
import { Button } from '@/presentation/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

interface AssignDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: LaundryOrder | null
  drivers: LaundryDriver[]
  onAssign: (orderId: string, driverId: string) => void
  onAutoAssign?: (orderId: string) => void
}

export const AssignDriverModal = ({
  open,
  onOpenChange,
  order,
  drivers,
  onAssign,
  onAutoAssign,
}: AssignDriverModalProps) => {
  const { t } = useTranslation('laundry')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredDrivers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return drivers
    return drivers.filter(
      (d) => d.fullName.toLowerCase().includes(q) || d.email.toLowerCase().includes(q),
    )
  }, [drivers, search])

  const handleAssign = () => {
    if (!order || !selectedId) return
    onAssign(order.id, selectedId)
    onOpenChange(false)
    setSelectedId(null)
    setSearch('')
  }

  const handleAutoAssign = () => {
    if (!order) return
    onAutoAssign?.(order.id)
    onOpenChange(false)
  }

  const title = order?.driver ? t('reassignDriver') : t('assignDriver')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="size-5 text-primary" strokeWidth={2} />
            {title}
          </DialogTitle>
          {order && (
            <DialogDescription>{order.orderNumber} — {order.customer.name}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3 py-3">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder={t('searchDriverPlaceholder')}
          />

          <div className="max-h-64 space-y-1.5 overflow-y-auto">
            {filteredDrivers.map((driver, index) => {
              const isSelected = selectedId === driver.id
              const initials = driver.fullName.split(' ').map(w => w[0]).join('').slice(0, 2)

              return (
                <motion.button
                  key={driver.id}
                  type="button"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedId(driver.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-all',
                    isSelected
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/50 bg-background hover:bg-muted/30',
                  )}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground/70">
                    {initials}
                  </div>
                  <div className="min-w-0 text-start">
                    <p className="text-sm font-medium text-foreground">{driver.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{driver.email}</p>
                  </div>
                  {isSelected && (
                    <Check className="ms-auto size-4 shrink-0 text-primary" strokeWidth={2.5} />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAutoAssign && (
            <Button variant="outline" className="gap-2 flex-1" onClick={handleAutoAssign}>
              <Wand2 className="size-3.5" strokeWidth={2} />
              {t('autoAssign')}
            </Button>
          )}
          <Button className="flex-1" onClick={handleAssign} disabled={!selectedId}>
            {title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
