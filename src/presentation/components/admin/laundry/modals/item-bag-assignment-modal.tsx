import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Package, Pencil, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { ItemBagAssignment, LaundryBag, LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { BagStatus } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import { Checkbox } from '@/presentation/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { SearchInput } from '@/presentation/components/ui/search-input'
import { cn } from '@/presentation/utils'

import {
  getAssignedQuantity,
  getRemainingQuantity,
} from '../shared/laundry-order.utils'

type ModalStep = 'items' | 'bag'

interface ItemBagAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: LaundryOrder | null
  availableBags: { id: string; bagId: string }[]
  onSaveAssignments: (
    orderId: string,
    bagAssignments: ItemBagAssignment[],
    processingBags: LaundryBag[],
  ) => void
  labels: {
    title: string
    selectItems: string
    selectQuantity: string
    addAssignment: string
    selectBag: string
    searchBagPlaceholder: string
    currentAssignments: string
    remaining: string
    unassigned: string
    done: string
    back: string
    noBagsFound: string
    edit: string
    delete: string
    save: string
    cancel: string
  }
}

export const ItemBagAssignmentModal = ({
  open,
  onOpenChange,
  order,
  availableBags,
  onSaveAssignments,
  labels,
}: ItemBagAssignmentModalProps) => {
  const [step, setStep] = useState<ModalStep>('items')
  const [selections, setSelections] = useState<Record<string, { checked: boolean; quantity: number }>>({})
  const [bagQuery, setBagQuery] = useState('')
  const [localAssignments, setLocalAssignments] = useState<ItemBagAssignment[]>([])
  const [localBags, setLocalBags] = useState<{ id: string; bagId: string }[]>([])
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [editedQty, setEditedQty] = useState<Record<string, number>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  const effectiveAssignments = useMemo(() => {
    if (!order) return localAssignments
    const persisted = order.bagAssignments
      .filter((a) => !removedIds.has(a.id))
      .map((a) => ({ ...a, quantity: editedQty[a.id] ?? a.quantity }))
    return [...persisted, ...localAssignments]
  }, [order, localAssignments, removedIds, editedQty])

  const allBags = useMemo(() => {
    if (!order) return localBags
    const persisted = order.processingBags.map((b) => ({ id: b.id, bagId: b.bagId }))
    const added = localBags.filter((lb) => !persisted.some((b) => b.id === lb.id))
    return [...persisted, ...added]
  }, [order, localBags])

  const filteredBags = useMemo(() => {
    const pool = [...availableBags, ...allBags]
    const unique = Array.from(new Map(pool.map((b) => [b.bagId, b])).values())
    const q = bagQuery.trim().toLowerCase()
    if (!q) return unique
    return unique.filter((b) => b.bagId.toLowerCase().includes(q))
  }, [availableBags, allBags, bagQuery])

  const resetState = () => {
    setStep('items')
    setSelections({})
    setBagQuery('')
    setLocalAssignments([])
    setLocalBags([])
    setRemovedIds(new Set())
    setEditedQty({})
    setEditingId(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetState()
    onOpenChange(next)
  }

  const pendingSelections = Object.entries(selections)
    .filter(([, v]) => v.checked && v.quantity > 0)
    .map(([itemId, v]) => ({ itemId, quantity: v.quantity }))

  const toggleItem = (itemId: string, maxQty: number) => {
    setSelections((prev) => {
      const current = prev[itemId]
      if (current?.checked) {
        const next = { ...prev }
        delete next[itemId]
        return next
      }
      return { ...prev, [itemId]: { checked: true, quantity: maxQty } }
    })
  }

  const setItemQuantity = (itemId: string, quantity: number, max: number) => {
    setSelections((prev) => ({
      ...prev,
      [itemId]: { checked: true, quantity: Math.min(max, Math.max(1, quantity)) },
    }))
  }

  const handleSelectBag = (bag: { id: string; bagId: string }) => {
    const newAssignments: ItemBagAssignment[] = pendingSelections.map((sel, i) => ({
      id: `local-${Date.now()}-${i}`,
      itemId: sel.itemId,
      bagId: bag.id,
      quantity: sel.quantity,
    }))

    setLocalAssignments((prev) => [...prev, ...newAssignments])
    if (!allBags.some((b) => b.id === bag.id)) {
      setLocalBags((prev) => [...prev, bag])
    }
    setSelections({})
    setBagQuery('')
    setStep('items')
  }

  const handleRemoveAssignment = (assignmentId: string) => {
    if (assignmentId.startsWith('local-')) {
      setLocalAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
    } else {
      setRemovedIds((prev) => new Set([...prev, assignmentId]))
    }
    if (editingId === assignmentId) setEditingId(null)
  }

  const handleSaveEdit = (assignmentId: string, quantity: number) => {
    if (assignmentId.startsWith('local-')) {
      setLocalAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, quantity } : a)),
      )
    } else {
      setEditedQty((prev) => ({ ...prev, [assignmentId]: quantity }))
    }
    setEditingId(null)
  }

  const hasChanges =
    localAssignments.length > 0 ||
    removedIds.size > 0 ||
    Object.keys(editedQty).length > 0

  const handleDone = () => {
    if (!order) return

    const bagIds = new Set(effectiveAssignments.map((a) => a.bagId))
    const processingBags: LaundryBag[] = []

    bagIds.forEach((bagId) => {
      const existing = order.processingBags.find((b) => b.id === bagId)
      if (existing) {
        processingBags.push(existing)
        return
      }
      const local = localBags.find((b) => b.id === bagId) ?? availableBags.find((b) => b.id === bagId)
      if (local) {
        processingBags.push({
          id: local.id,
          bagId: local.bagId,
          status: BagStatus.Processing,
          verified: true,
        })
      }
    })

    onSaveAssignments(order.id, effectiveAssignments, processingBags)
    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog open={open && !!order} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="size-5 text-primary" strokeWidth={2} />
                {labels.title}
              </DialogTitle>
              <DialogDescription>
                {order.orderNumber} — {order.customer.name}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto py-2">
              {effectiveAssignments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{labels.currentAssignments}</p>
                  <div className="space-y-1.5">
                    {effectiveAssignments.map((assignment) => {
                      const item = order.items.find((i) => i.id === assignment.itemId)
                      const bag = allBags.find((b) => b.id === assignment.bagId)
                      const isEditing = editingId === assignment.id
                      const maxQty =
                        (item?.quantity ?? assignment.quantity) -
                        getAssignedQuantity(assignment.itemId, effectiveAssignments) +
                        assignment.quantity

                      return (
                        <div
                          key={assignment.id}
                          className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground">
                              {item?.name ?? '—'} → <span className="font-mono">{bag?.bagId ?? '—'}</span>
                            </p>
                            {isEditing ? (
                              <div className="mt-1.5 flex items-center gap-2">
                                <input
                                  type="number"
                                  min={1}
                                  max={maxQty}
                                  defaultValue={assignment.quantity}
                                  id={`edit-${assignment.id}`}
                                  className="w-14 rounded-md border border-border bg-background px-2 py-1 text-center text-xs"
                                />
                                <Button
                                  size="xs"
                                  onClick={() => {
                                    const input = document.getElementById(`edit-${assignment.id}`) as HTMLInputElement
                                    handleSaveEdit(assignment.id, Number(input.value))
                                  }}
                                >
                                  {labels.save}
                                </Button>
                                <Button variant="ghost" size="xs" onClick={() => setEditingId(null)}>
                                  {labels.cancel}
                                </Button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-muted-foreground">× {assignment.quantity}</p>
                            )}
                          </div>
                          {!isEditing && (
                            <div className="flex shrink-0 gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setEditingId(assignment.id)}
                                aria-label={labels.edit}
                              >
                                <Pencil className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                aria-label={labels.delete}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 'items' ? (
                  <motion.div
                    key="items"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-medium text-muted-foreground">{labels.selectItems}</p>
                    <div className="space-y-1.5">
                      {order.items.map((item) => {
                        const remaining = getRemainingQuantity(item, effectiveAssignments)
                        const assigned = getAssignedQuantity(item.id, effectiveAssignments)
                        const sel = selections[item.id]
                        if (remaining === 0) return null

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                              sel?.checked ? 'border-primary/40 bg-primary/5' : 'border-border/50',
                            )}
                          >
                            <Checkbox
                              checked={sel?.checked ?? false}
                              onCheckedChange={() => toggleItem(item.id, remaining)}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {assigned > 0
                                  ? `${labels.remaining}: ${remaining} / ${item.quantity}`
                                  : labels.unassigned}
                              </p>
                            </div>
                            {sel?.checked && (
                              <input
                                type="number"
                                min={1}
                                max={remaining}
                                value={sel.quantity}
                                onChange={(e) =>
                                  setItemQuantity(item.id, Number(e.target.value), remaining)
                                }
                                className="w-14 rounded-md border border-border bg-background px-2 py-1 text-center text-xs"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={pendingSelections.length === 0}
                      onClick={() => setStep('bag')}
                    >
                      {labels.addAssignment}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bag"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon-xs" onClick={() => setStep('items')}>
                        <ArrowLeft className="size-3.5" />
                      </Button>
                      <p className="text-xs font-medium text-muted-foreground">{labels.selectBag}</p>
                    </div>
                    <SearchInput
                      value={bagQuery}
                      onValueChange={setBagQuery}
                      placeholder={labels.searchBagPlaceholder}
                    />
                    <div className="max-h-48 space-y-1.5 overflow-y-auto">
                      {filteredBags.length === 0 ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">{labels.noBagsFound}</p>
                      ) : (
                        filteredBags.map((bag) => (
                          <button
                            key={bag.id}
                            type="button"
                            onClick={() => handleSelectBag(bag)}
                            className="flex w-full items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 transition-all hover:border-primary/40 hover:bg-muted/30"
                          >
                            <span className="font-mono text-sm font-medium">{bag.bagId}</span>
                            <Search className="size-3.5 text-muted-foreground" />
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {hasChanges && step === 'items' && (
              <Button className="w-full gap-2" onClick={handleDone}>
                <Check className="size-4" />
                {labels.done}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
