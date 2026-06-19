import { BagStatus, LaundryWorkflowStage, UrgencyLevel } from '@/domain/enums'
import type { LaundryDriver, LaundryOrder, LaundryStats } from '@/domain/entities/laundry-order.entity'

export const laundryStats: LaundryStats = {
  receivedToday: 47,
  processedToday: 32,
  dispatchedToday: 28,
  avgProcessingTime: '3h 42m',
  bagsInLaundry: 156,
}

export const availableDrivers: LaundryDriver[] = [
  { id: 'drv-1', fullName: 'Ahmed Hassan', email: 'ahmed.h@cleno.app', avatarUrl: null, phone: '+966 55 123 4567' },
  { id: 'drv-2', fullName: 'Omar Khalid', email: 'omar.k@cleno.app', avatarUrl: null, phone: '+966 55 234 5678' },
  { id: 'drv-3', fullName: 'Youssef Ali', email: 'youssef.a@cleno.app', avatarUrl: null, phone: '+966 55 345 6789' },
  { id: 'drv-4', fullName: 'Karim Nabil', email: 'karim.n@cleno.app', avatarUrl: null, phone: '+966 55 456 7890' },
  { id: 'drv-5', fullName: 'Tariq Mansour', email: 'tariq.m@cleno.app', avatarUrl: null, phone: '+966 55 567 8901' },
]

export const availableProcessingBags = [
  { id: 'pool-001', bagId: 'PROC-2001' },
  { id: 'pool-002', bagId: 'PROC-2002' },
  { id: 'pool-003', bagId: 'PROC-2003' },
  { id: 'pool-004', bagId: 'PROC-2004' },
  { id: 'pool-005', bagId: 'PROC-2005' },
  { id: 'pool-006', bagId: 'PROC-2006' },
  { id: 'pool-007', bagId: 'PROC-2007' },
  { id: 'pool-008', bagId: 'PROC-2008' },
  { id: 'pool-009', bagId: 'PROC-2009' },
  { id: 'pool-010', bagId: 'PROC-2010' },
]

const now = new Date()
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
const hoursFromNow = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString()

export const laundryOrders: LaundryOrder[] = [
  {
    id: 'lo-001',
    orderNumber: 'ORG-041',
    customer: { id: 'cust-1', name: 'FreshWay Hotels', type: 'Hotel Chain', logoUrl: null, branchId: 'br-1', branchName: 'Downtown Branch' },
    stage: LaundryWorkflowStage.IncomingToLaundry,
    urgency: UrgencyLevel.Normal,
    pickupBags: [
      { id: 'bag-001', bagId: 'BAG-1041', status: BagStatus.OnTheWay, verified: false },
      { id: 'bag-002', bagId: 'BAG-1042', status: BagStatus.OnTheWay, verified: false },
    ],
    processingBags: [],
    bagAssignments: [],
    items: [
      { id: 'item-1', name: 'Large Towel', quantity: 20 },
      { id: 'item-2', name: 'Bed Sheet King', quantity: 8 },
    ],
    itemCount: 28,
    pickupTime: hoursAgo(1),
    deliverBy: hoursFromNow(8),
    inLaundrySince: null,
    driver: null,
    incidents: [],
    notes: [],
    slaDeadline: null,
  },
  {
    id: 'lo-002',
    orderNumber: 'ORG-040',
    customer: { id: 'cust-2', name: 'Riyadh Grand Hotel', type: 'Hotel', logoUrl: null, branchId: 'br-2', branchName: 'Al Olaya Branch' },
    stage: LaundryWorkflowStage.IncomingToLaundry,
    urgency: UrgencyLevel.Warning,
    pickupBags: [
      { id: 'bag-003', bagId: 'BAG-1038', status: BagStatus.OnTheWay, verified: false },
      { id: 'bag-004', bagId: 'BAG-1039', status: BagStatus.OnTheWay, verified: false },
      { id: 'bag-005', bagId: 'BAG-1040', status: BagStatus.OnTheWay, verified: false },
    ],
    processingBags: [],
    bagAssignments: [],
    items: [
      { id: 'item-3', name: 'Pillow Case', quantity: 30 },
      { id: 'item-4', name: 'Bath Towel', quantity: 15 },
      { id: 'item-5', name: 'Face Towel', quantity: 25 },
    ],
    itemCount: 70,
    pickupTime: hoursAgo(3),
    deliverBy: hoursFromNow(4),
    inLaundrySince: null,
    driver: null,
    incidents: [
      { id: 'inc-1', type: 'Damaged Bag', content: 'Bag BAG-1038 arrived with damaged zipper', createdAt: hoursAgo(2), author: 'Sara Al-Harbi', stage: LaundryWorkflowStage.IncomingToLaundry, replies: [] },
    ],
    notes: [],
    slaDeadline: null,
  },
  {
    id: 'lo-003',
    orderNumber: 'ORG-038',
    customer: { id: 'cust-3', name: 'Al Faisaliah Suites', type: 'Luxury Residence', logoUrl: null, branchId: 'br-3', branchName: 'King Fahd Rd' },
    stage: LaundryWorkflowStage.InLaundry,
    urgency: UrgencyLevel.Urgent,
    pickupBags: [
      { id: 'bag-006', bagId: 'BAG-1035', status: BagStatus.OnTheWay, verified: true },
      { id: 'bag-007', bagId: 'BAG-1036', status: BagStatus.OnTheWay, verified: true },
    ],
    processingBags: [
      { id: 'proc-001', bagId: 'PROC-2001', status: BagStatus.Processing, verified: true },
      { id: 'proc-002', bagId: 'PROC-2002', status: BagStatus.Processing, verified: true },
    ],
    bagAssignments: [
      { id: 'asgn-1', itemId: 'item-6', bagId: 'proc-001', quantity: 10 },
      { id: 'asgn-2', itemId: 'item-7', bagId: 'proc-001', quantity: 10 },
      { id: 'asgn-3', itemId: 'item-8', bagId: 'proc-002', quantity: 5 },
    ],
    items: [
      { id: 'item-6', name: 'Duvet Cover', quantity: 10 },
      { id: 'item-7', name: 'Fitted Sheet', quantity: 10 },
      { id: 'item-8', name: 'Bath Robe', quantity: 5 },
    ],
    itemCount: 25,
    pickupTime: hoursAgo(6),
    deliverBy: hoursFromNow(1),
    inLaundrySince: hoursAgo(4.25),
    driver: null,
    incidents: [
      { id: 'inc-2', type: 'Extra Treatment', content: 'Extra wash cycle required for duvet covers', createdAt: hoursAgo(3), author: 'Wash Team', stage: LaundryWorkflowStage.InLaundry, replies: [
        { id: 'rep-1', content: 'Approved — run extended cycle', createdAt: hoursAgo(2.5), author: 'Supervisor' },
      ] },
    ],
    notes: [],
    slaDeadline: hoursFromNow(1),
  },
  {
    id: 'lo-004',
    orderNumber: 'ORG-036',
    customer: { id: 'cust-4', name: 'Novotel Business Bay', type: 'Hotel', logoUrl: null, branchId: 'br-4', branchName: 'Business Bay' },
    stage: LaundryWorkflowStage.InLaundry,
    urgency: UrgencyLevel.Overdue,
    pickupBags: [
      { id: 'bag-008', bagId: 'BAG-1030', status: BagStatus.OnTheWay, verified: true },
    ],
    processingBags: [
      { id: 'proc-003', bagId: 'PROC-2003', status: BagStatus.Processing, verified: true },
      { id: 'proc-004', bagId: 'PROC-2004', status: BagStatus.Processing, verified: true },
    ],
    bagAssignments: [
      { id: 'asgn-4', itemId: 'item-9', bagId: 'proc-003', quantity: 40 },
      { id: 'asgn-5', itemId: 'item-10', bagId: 'proc-004', quantity: 20 },
    ],
    items: [
      { id: 'item-9', name: 'Towel Set', quantity: 40 },
      { id: 'item-10', name: 'Bed Linen Set', quantity: 20 },
      { id: 'item-10b', name: 'Uniform', quantity: 8 },
    ],
    itemCount: 68,
    pickupTime: hoursAgo(10),
    deliverBy: hoursAgo(1),
    inLaundrySince: hoursAgo(7),
    driver: null,
    incidents: [
      { id: 'inc-3', type: 'Missing Barcode', content: 'Missing barcode on one pickup bag', createdAt: hoursAgo(9), author: 'Receiving', stage: LaundryWorkflowStage.IncomingToLaundry, replies: [] },
      { id: 'inc-4', type: 'Quality Issue', content: 'Quality check failed — stain remains on uniform', createdAt: hoursAgo(1), author: 'QC Team', stage: LaundryWorkflowStage.InLaundry, replies: [] },
    ],
    notes: [],
    slaDeadline: hoursAgo(1),
  },
  {
    id: 'lo-005',
    orderNumber: 'ORG-034',
    customer: { id: 'cust-1', name: 'FreshWay Hotels', type: 'Hotel Chain', logoUrl: null, branchId: 'br-5', branchName: 'Airport Branch' },
    stage: LaundryWorkflowStage.InLaundry,
    urgency: UrgencyLevel.Normal,
    pickupBags: [
      { id: 'bag-012', bagId: 'BAG-1028', status: BagStatus.OnTheWay, verified: true },
    ],
    processingBags: [],
    bagAssignments: [],
    items: [
      { id: 'item-11', name: 'Napkin', quantity: 50 },
      { id: 'item-12', name: 'Table Cloth', quantity: 10 },
      { id: 'item-12b', name: 'Small Towel', quantity: 30 },
      { id: 'item-12c', name: 'Large Towel', quantity: 20 },
    ],
    itemCount: 110,
    pickupTime: hoursAgo(5),
    deliverBy: hoursFromNow(6),
    inLaundrySince: hoursAgo(0.5),
    driver: null,
    incidents: [],
    notes: [],
    slaDeadline: hoursFromNow(6),
  },
  {
    id: 'lo-006',
    orderNumber: 'ORG-033',
    customer: { id: 'cust-5', name: 'Hyatt Regency', type: 'Hotel', logoUrl: null, branchId: 'br-6', branchName: 'Corniche Road' },
    stage: LaundryWorkflowStage.ReadyForDelivery,
    urgency: UrgencyLevel.Normal,
    pickupBags: [
      { id: 'bag-013', bagId: 'BAG-1025', status: BagStatus.OnTheWay, verified: true },
    ],
    processingBags: [
      { id: 'proc-005', bagId: 'PROC-2005', status: BagStatus.Ready, verified: true },
      { id: 'proc-006', bagId: 'PROC-2006', status: BagStatus.Ready, verified: true },
    ],
    bagAssignments: [
      { id: 'asgn-6', itemId: 'item-13', bagId: 'proc-005', quantity: 30 },
      { id: 'asgn-7', itemId: 'item-14', bagId: 'proc-006', quantity: 10 },
    ],
    items: [
      { id: 'item-13', name: 'Pool Towel', quantity: 30 },
      { id: 'item-14', name: 'Spa Robe', quantity: 10 },
    ],
    itemCount: 40,
    pickupTime: hoursAgo(12),
    deliverBy: hoursFromNow(3),
    inLaundrySince: hoursAgo(8),
    driver: availableDrivers[0],
    incidents: [],
    notes: [],
    slaDeadline: hoursFromNow(3),
  },
  {
    id: 'lo-007',
    orderNumber: 'ORG-031',
    customer: { id: 'cust-2', name: 'Riyadh Grand Hotel', type: 'Hotel', logoUrl: null, branchId: 'br-2', branchName: 'Al Olaya Branch' },
    stage: LaundryWorkflowStage.ReadyForDelivery,
    urgency: UrgencyLevel.Warning,
    pickupBags: [
      { id: 'bag-015', bagId: 'BAG-1022', status: BagStatus.OnTheWay, verified: true },
    ],
    processingBags: [
      { id: 'proc-007', bagId: 'PROC-2007', status: BagStatus.Ready, verified: true },
      { id: 'proc-008', bagId: 'PROC-2008', status: BagStatus.Ready, verified: true },
      { id: 'proc-009', bagId: 'PROC-2009', status: BagStatus.Ready, verified: true },
    ],
    bagAssignments: [
      { id: 'asgn-8', itemId: 'item-15', bagId: 'proc-007', quantity: 6 },
      { id: 'asgn-9', itemId: 'item-16', bagId: 'proc-008', quantity: 12 },
    ],
    items: [
      { id: 'item-15', name: 'Curtain Panel', quantity: 6 },
      { id: 'item-16', name: 'Cushion Cover', quantity: 12 },
    ],
    itemCount: 18,
    pickupTime: hoursAgo(16),
    deliverBy: hoursFromNow(1),
    inLaundrySince: hoursAgo(12),
    driver: null,
    incidents: [
      { id: 'inc-5', type: 'Delivery Instruction', content: 'Deliver to back entrance only', createdAt: hoursAgo(14), author: 'Operations', stage: LaundryWorkflowStage.ReadyForDelivery, replies: [] },
    ],
    notes: [{ id: 'note-1', content: 'Call customer 15 min before arrival', createdAt: hoursAgo(12), author: 'Dispatch' }],
    slaDeadline: hoursFromNow(1),
  },
  {
    id: 'lo-008',
    orderNumber: 'ORG-029',
    customer: { id: 'cust-3', name: 'Al Faisaliah Suites', type: 'Luxury Residence', logoUrl: null, branchId: 'br-3', branchName: 'King Fahd Rd' },
    stage: LaundryWorkflowStage.ReadyForDelivery,
    urgency: UrgencyLevel.Overdue,
    pickupBags: [
      { id: 'bag-018', bagId: 'BAG-1019', status: BagStatus.OnTheWay, verified: true },
    ],
    processingBags: [
      { id: 'proc-010', bagId: 'PROC-2010', status: BagStatus.Ready, verified: true },
    ],
    bagAssignments: [
      { id: 'asgn-10', itemId: 'item-17', bagId: 'proc-010', quantity: 4 },
    ],
    items: [
      { id: 'item-17', name: 'Silk Pillowcase', quantity: 4 },
    ],
    itemCount: 4,
    pickupTime: hoursAgo(20),
    deliverBy: hoursAgo(2),
    inLaundrySince: hoursAgo(14),
    driver: availableDrivers[2],
    incidents: [
      { id: 'inc-6', type: 'Driver Change', content: 'Driver reassigned due to route change', createdAt: hoursAgo(3), author: 'Dispatch', stage: LaundryWorkflowStage.ReadyForDelivery, replies: [
        { id: 'rep-2', content: 'New driver confirmed ETA 30 min', createdAt: hoursAgo(2), author: 'Dispatch' },
      ] },
      { id: 'inc-7', type: 'Delivery Delay', content: 'Delivery delay noted — traffic on King Fahd Rd', createdAt: hoursAgo(1), author: 'Dispatch', stage: LaundryWorkflowStage.ReadyForDelivery, replies: [] },
    ],
    notes: [],
    slaDeadline: hoursAgo(2),
  },
  {
    id: 'lo-009',
    orderNumber: 'ORG-042',
    customer: { id: 'cust-6', name: 'Marriott Downtown', type: 'Hotel', logoUrl: null, branchId: 'br-7', branchName: 'King Abdullah Rd' },
    stage: LaundryWorkflowStage.IncomingToLaundry,
    urgency: UrgencyLevel.Normal,
    pickupBags: [
      { id: 'bag-019', bagId: 'BAG-1043', status: BagStatus.OnTheWay, verified: false },
    ],
    processingBags: [],
    bagAssignments: [],
    items: [
      { id: 'item-18', name: 'Hand Towel', quantity: 40 },
    ],
    itemCount: 40,
    pickupTime: hoursAgo(0.5),
    deliverBy: hoursFromNow(10),
    inLaundrySince: null,
    driver: null,
    incidents: [],
    notes: [],
    slaDeadline: null,
  },
]
