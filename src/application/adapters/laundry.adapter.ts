import type {
  CompanyDropdownItemDto,
  IncidentDetailDto,
  LaundryBoardItemDto,
  LaundryBoardStatsDto,
  LaundryBoardTab,
  LaundryOverdueAlertDto,
  OrderBagAssignmentDto,
  OrderBagsDataDto,
  OrderIncidentListItemDto,
  OrderNotesDataDto,
} from '@/application/dtos/laundry/laundry-ops.dto'
import type {
  ItemBagAssignment,
  LaundryBag,
  LaundryDriver,
  LaundryIncident,
  LaundryIncidentReply,
  LaundryOrder,
  LaundryOrderNote,
  LaundryStats,
} from '@/domain/entities/laundry-order.entity'
import {
  BagStatus,
  LaundryWorkflowStage,
  OrderStatus,
  UrgencyLevel,
  parseOrderStatus,
} from '@/domain/enums'
import type { SearchableSelectOption } from '@/presentation/components/ui/searchable-select'

const ORDER_BAG_STAGE_PICKUP = 1
const ORDER_BAG_STAGE_PROCESSING = 2

const parseBagStatus = (value: number): BagStatus => {
  if (value <= 2) return BagStatus.OnTheWay
  if (value === 3) return BagStatus.Processing
  return BagStatus.Ready
}

const parseUrgency = (badge: LaundryBoardItemDto['urgencyBadge']): UrgencyLevel => {
  switch (badge) {
    case 'OVERDUE':
      return UrgencyLevel.Overdue
    case 'URGENT':
      return UrgencyLevel.Urgent
    case 'WARNING':
      return UrgencyLevel.Warning
    default:
      return UrgencyLevel.Normal
  }
}

const statusToStage = (status: number): LaundryWorkflowStage => {
  switch (parseOrderStatus(status)) {
    case OrderStatus.InLaundry:
      return LaundryWorkflowStage.InLaundry
    case OrderStatus.ReadyForDelivery:
      return LaundryWorkflowStage.ReadyForDelivery
    default:
      return LaundryWorkflowStage.IncomingToLaundry
  }
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}

const toInLaundrySince = (durationMinutes: number | null): string | null => {
  if (durationMinutes == null || durationMinutes <= 0) return null
  return new Date(Date.now() - durationMinutes * 60_000).toISOString()
}

const toDriver = (name: string | null): LaundryDriver | null => {
  if (!name) return null
  return {
    id: name,
    fullName: name,
    email: '',
    avatarUrl: null,
  }
}

const splitBags = (bags: LaundryBoardItemDto['bags']) => {
  const pickupBags: LaundryBag[] = []
  const processingBags: LaundryBag[] = []

  bags.forEach((bag) => {
    const mapped: LaundryBag = {
      id: bag.bagId,
      bagId: bag.bagNumber,
      status: parseBagStatus(bag.bagStatus),
      verified: bag.bagStatus >= 2,
    }

    if (bag.stage === ORDER_BAG_STAGE_PICKUP) {
      pickupBags.push(mapped)
      return
    }

    if (bag.stage === ORDER_BAG_STAGE_PROCESSING) {
      processingBags.push(mapped)
    }
  })

  return { pickupBags, processingBags }
}

export const laundryAdapter = {
  stageToTab(stage: LaundryWorkflowStage): LaundryBoardTab {
    switch (stage) {
      case LaundryWorkflowStage.InLaundry:
        return 'InLaundry'
      case LaundryWorkflowStage.ReadyForDelivery:
        return 'ReadyForDelivery'
      default:
        return 'Incoming'
    }
  },

  stageToBulkStatus(stage: LaundryWorkflowStage): number {
    switch (stage) {
      case LaundryWorkflowStage.IncomingToLaundry:
        return OrderStatus.InLaundry
      case LaundryWorkflowStage.InLaundry:
        return OrderStatus.ReadyForDelivery
      default:
        return OrderStatus.Delivered
    }
  },

  targetStageToStatus(target: LaundryWorkflowStage): number | null {
    switch (target) {
      case LaundryWorkflowStage.InLaundry:
        return OrderStatus.InLaundry
      case LaundryWorkflowStage.ReadyForDelivery:
        return OrderStatus.ReadyForDelivery
      default:
        return null
    }
  },

  toStats(dto: LaundryBoardStatsDto): LaundryStats {
    return {
      receivedToday: dto.receivedToday,
      processedToday: dto.processedToday,
      dispatchedToday: dto.dispatchedToday,
      avgProcessingTime: formatDuration(dto.avgProcessingTimeMinutes),
      bagsInLaundry: dto.bagsInLaundry,
    }
  },

  toOverdueAlert(dto: LaundryOverdueAlertDto) {
    return {
      count: dto.count,
      orders: dto.orders,
    }
  },

  toLaundryOrder(dto: LaundryBoardItemDto): LaundryOrder {
    const { pickupBags, processingBags } = splitBags(dto.bags)

    return {
      id: dto.id,
      slug: dto.slug,
      orderNumber: dto.orderNumber,
      customer: {
        id: dto.id,
        name: dto.companyName,
        type: dto.companyType,
        logoUrl: null,
        branchId: dto.branchName,
        branchName: dto.branchName,
      },
      stage: statusToStage(dto.status),
      urgency: parseUrgency(dto.urgencyBadge),
      pickupBags,
      processingBags,
      bagAssignments: [],
      items: dto.items.map((item) => ({
        id: item.laundryItemId,
        name: item.itemName,
        quantity: item.quantity,
      })),
      itemCount: dto.totalItems,
      pickupTime: dto.pickupTime,
      deliverBy: dto.deliverByTime,
      inLaundrySince: toInLaundrySince(dto.durationInLaundryMinutes),
      driver: toDriver(dto.assignedDriverName),
      incidents: [],
      notes: [],
      slaDeadline: null,
      hasOpenIncidents: dto.hasOpenIncidents,
    }
  },

  toCompanyOptions(items: CompanyDropdownItemDto[]): SearchableSelectOption[] {
    return items.map((item) => ({ value: item.id, label: item.name }))
  },

  toOrderNotes(dto: OrderNotesDataDto): LaundryOrderNote[] {
    return dto.notes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      author: note.authorName,
    }))
  },

  toBagAssignments(assignments: OrderBagAssignmentDto[]): ItemBagAssignment[] {
    return assignments.map((assignment) => ({
      id: assignment.id,
      itemId: assignment.laundryItemId,
      bagId: assignment.bagId,
      quantity: assignment.quantity,
    }))
  },

  toBagModalOrder(order: LaundryOrder, bagsData: OrderBagsDataDto): LaundryOrder {
    const bagMap = new Map<string, LaundryBag>()

    bagsData.assignments.forEach((assignment) => {
      if (!bagMap.has(assignment.bagId)) {
        bagMap.set(assignment.bagId, {
          id: assignment.bagId,
          bagId: assignment.bagNumber,
          status: BagStatus.Processing,
          verified: true,
        })
      }
    })

    return {
      ...order,
      bagAssignments: laundryAdapter.toBagAssignments(bagsData.assignments),
      processingBags: Array.from(bagMap.values()),
      items: bagsData.availableItems.map((item) => ({
        id: item.laundryItemId,
        name: item.itemName,
        quantity: item.orderedQuantity,
      })),
    }
  },

  toIncidentListItem(dto: OrderIncidentListItemDto): LaundryIncident {
    return {
      id: dto.slug,
      slug: dto.slug,
      type: dto.typeLabel || dto.title,
      content: dto.summary,
      createdAt: dto.createdAt,
      author: '',
      stage: incidentStageToWorkflow(dto.stage),
      replies: [],
      isOpen: dto.isOpen,
      replyCount: dto.replyCount,
    }
  },

  toIncidentDetail(dto: IncidentDetailDto): LaundryIncident {
    return {
      id: dto.slug,
      slug: dto.slug,
      type: dto.typeLabel || dto.title,
      content: dto.description,
      createdAt: dto.createdAt,
      author: dto.reporterName,
      stage: incidentStageToWorkflow(dto.stage),
      replies: dto.replies.map(
        (reply): LaundryIncidentReply => ({
          id: reply.id,
          content: reply.message,
          createdAt: reply.createdAt,
          author: reply.authorName,
        }),
      ),
    }
  },
}

const incidentStageToWorkflow = (stage: number): LaundryWorkflowStage => {
  switch (stage) {
    case 2:
      return LaundryWorkflowStage.InLaundry
    case 3:
      return LaundryWorkflowStage.ReadyForDelivery
    default:
      return LaundryWorkflowStage.IncomingToLaundry
  }
}
