import { useEffect } from 'react'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { LaundryWorkflowStage } from '@/domain/enums'

interface UseKeyboardShortcutsOptions {
  orders: LaundryOrder[]
  onReceiveFirst: (order: LaundryOrder) => void
  onDispatchFirst: (order: LaundryOrder) => void
  onFocusSearch: () => void
  onToggleView: () => void
  onEscape?: () => void
  enabled?: boolean
}

export const useKeyboardShortcuts = ({
  orders,
  onReceiveFirst,
  onDispatchFirst,
  onFocusSearch,
  onToggleView,
  onEscape,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (e.key === 'Escape') {
        if (isInput) return
        onEscape?.()
        return
      }

      if (isInput) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onFocusSearch()
        return
      }

      switch (e.key.toLowerCase()) {
        case 'r': {
          const firstIncoming = orders.find((o) => o.stage === LaundryWorkflowStage.IncomingToLaundry)
          if (firstIncoming) onReceiveFirst(firstIncoming)
          break
        }
        case 'd': {
          const firstReady = orders.find((o) => o.stage === LaundryWorkflowStage.ReadyForDelivery)
          if (firstReady) onDispatchFirst(firstReady)
          break
        }
        case 'v': {
          if (!e.ctrlKey && !e.metaKey) onToggleView()
          break
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [orders, onReceiveFirst, onDispatchFirst, onFocusSearch, onToggleView, onEscape, enabled])
}
