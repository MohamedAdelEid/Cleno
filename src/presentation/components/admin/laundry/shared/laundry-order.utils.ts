import type { ItemBagAssignment, LaundryItem, LaundryOrder } from '@/domain/entities/laundry-order.entity'

export const getAssignedQuantity = (
  itemId: string,
  assignments: ItemBagAssignment[],
): number =>
  assignments.filter((a) => a.itemId === itemId).reduce((sum, a) => sum + a.quantity, 0)

export const getRemainingQuantity = (item: LaundryItem, assignments: ItemBagAssignment[]): number =>
  Math.max(0, item.quantity - getAssignedQuantity(item.id, assignments))

export const getProcessingBagCount = (order: LaundryOrder): number => order.processingBags.length

export const getPickupBagCount = (order: LaundryOrder): number => order.pickupBags.length

export const getIncidentsForStage = (order: LaundryOrder, stage: LaundryOrder['stage']) =>
  order.incidents.filter((incident) => incident.stage === stage)

export const getTotalIncidentCount = (order: LaundryOrder): number => order.incidents.length
