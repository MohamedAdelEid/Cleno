import type { OperationalBag } from '@/domain/entities'
import { OperationalBagSystemStatus } from '@/domain/enums'

export const getBulkActivateBagIds = (bags: OperationalBag[], selectedIds: string[]) =>
  selectedIds.filter((id) => {
    const bag = bags.find((item) => item.id === id)
    return bag?.systemStatus === OperationalBagSystemStatus.Inactive
  })

export const getBulkDeactivateBagIds = (bags: OperationalBag[], selectedIds: string[]) =>
  selectedIds.filter((id) => {
    const bag = bags.find((item) => item.id === id)
    return bag?.systemStatus === OperationalBagSystemStatus.Active
  })
