import type {
  CompaniesAdminAllDataDto,
  CompanyAdminItemDto,
  CompanyForEditDto,
} from '@/application/dtos/companies/companies-admin.dto'
import type {
  CompanyProfileActivityDto,
  CompanyProfileBranchDto,
  CompanyProfileDto,
  CompanyProfileInvoiceDto,
  CompanyProfileOrderDto,
  CompanyProfileRecentInvoiceDto,
  CompanyProfileRecentOrderDto,
} from '@/application/dtos/companies/company-profile.dto'
import type {
  CompanyCreateRequestDto,
  CompanyUpdateRequestDto,
} from '@/application/dtos/companies/create-company.dto'
import type { ManagedCompany } from '@/domain/entities'
import type {
  CompanyActivity,
  CompanyActivityType,
  CompanyAlert,
  CompanyDetailsBranch,
  CompanyDetailsData,
  CompanyFinancials,
  CompanyInvoice,
  CompanyOrder,
} from '@/domain/entities/company-details.entity'
import type { CompanyFormValues } from '@/domain/schemas'
import { CompanyAccountStatus, parseOrderStatus } from '@/domain/enums'
import type {
  CompaniesAdminList,
  CompanyEditDetails,
  CompanyStat,
  CompanyStatKey,
  RemoteFileReference,
  UploadedFile,
} from '@/domain/types'

const COMPANY_STAT_KEYS = new Set<CompanyStatKey>([
  'totalCompanies',
  'activeCompanies',
  'inactiveCompanies',
  'totalBranches',
])

const isCompanyStatKey = (key: string): key is CompanyStatKey =>
  COMPANY_STAT_KEYS.has(key as CompanyStatKey)

const parseStatus = (status: number): CompanyAccountStatus => {
  const values = Object.values(CompanyAccountStatus) as CompanyAccountStatus[]
  if (values.includes(status as CompanyAccountStatus)) {
    return status as CompanyAccountStatus
  }

  return CompanyAccountStatus.PendingEmailVerification
}

const toRemoteFileReference = (
  value: string | RemoteFileReference | null | undefined,
): RemoteFileReference | null => {
  if (!value) return null

  if (typeof value === 'string') {
    return { path: value, url: value }
  }

  if (!value.path && !value.url) return null

  return {
    path: value.path ?? null,
    url: value.url ?? value.path ?? null,
  }
}

const toWriteFilePath = (
  field: 'logo' | 'commercialRegistration',
  uploadedFiles: Partial<Record<'logo' | 'commercialRegistration', UploadedFile>>,
  existingFilePaths?: Partial<Record<'logo' | 'commercialRegistration', string | null>>,
): string | null => uploadedFiles[field]?.filePath ?? existingFilePaths?.[field] ?? null

const KNOWN_ACTIVITY_TYPES = new Set<CompanyActivityType>([
  'company_registered',
  'company_approved',
  'branch_created',
  'branch_added',
  'order_created',
  'driver_assigned',
  'order_picked_up',
  'order_in_laundry',
  'order_ready',
  'order_delivered',
  'order_cancelled',
  'invoice_generated',
  'incident_reported',
  'payment_received',
  'status_changed',
])

const parseActivityType = (type: string): CompanyActivityType => {
  if (type === 'branch_created') return 'branch_created'
  if (KNOWN_ACTIVITY_TYPES.has(type as CompanyActivityType)) {
    return type as CompanyActivityType
  }

  return 'status_changed'
}

const parseInvoiceStatus = (paymentStatus: number): CompanyInvoice['status'] => {
  if (paymentStatus === 2) return 'paid'
  if (paymentStatus === 3) return 'overdue'
  return 'pending'
}

const buildAlerts = (
  stats: CompanyProfileDto['stats'],
  alertsCount: number,
): CompanyAlert[] => {
  const alerts: CompanyAlert[] = []

  if (stats.overdueInvoices > 0) {
    alerts.push({
      id: 'overdue-invoices',
      type: 'overdue_invoices',
      title: `${stats.overdueInvoices} overdue invoice${stats.overdueInvoices === 1 ? '' : 's'}`,
      description: `Outstanding balance: ${stats.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      count: stats.overdueInvoices,
      severity: 'warning',
    })
  }

  if (stats.pendingInvoices > 0) {
    alerts.push({
      id: 'pending-invoices',
      type: 'dispatch_ready',
      title: `${stats.pendingInvoices} pending invoice${stats.pendingInvoices === 1 ? '' : 's'}`,
      description: 'Invoices awaiting payment',
      count: stats.pendingInvoices,
      severity: 'info',
    })
  }

  if (alerts.length === 0 && alertsCount > 0) {
    alerts.push({
      id: 'general-alerts',
      type: 'dispatch_ready',
      title: `${alertsCount} alert${alertsCount === 1 ? '' : 's'}`,
      description: 'Review company activity for details',
      count: alertsCount,
      severity: 'info',
    })
  }

  return alerts
}

export const companyAdapter = {
  toManagedCompany(dto: CompanyAdminItemDto): ManagedCompany {
    const photo = toRemoteFileReference(dto.photo)
    const commercialRegistration = toRemoteFileReference(dto.commercialRegistration)

    return {
      id: dto.id,
      slug: dto.slug,
      name: dto.name,
      type: dto.type,
      email: dto.email,
      logoUrl: photo?.url ?? null,
      logoPath: photo?.path ?? null,
      responsible: {
        id: dto.id,
        fullName: dto.mainResponsiblePerson,
        email: dto.email,
        phone: dto.phone,
      },
      phone: dto.phone,
      commercialRegistration: commercialRegistration?.path ?? null,
      commercialRegistrationFile: commercialRegistration,
      branchesCount: dto.branchesCount ?? 0,
      branches: (dto.branches ?? []).map((branch) => ({
        id: branch.id,
        name: branch.name,
        slug: branch.slug,
        email: branch.email,
      })),
      activeOrders: dto.activeOrders,
      completedOrders: dto.completedOrders,
      pendingInvoices: dto.pendingInvoices,
      outstandingBalance: dto.outstanding,
      status: parseStatus(dto.status),
      isActive: dto.isActive,
      createdAt: dto.createdAt,
    }
  },

  toAdminList(dto: CompaniesAdminAllDataDto): CompaniesAdminList {
    return {
      stats: (dto.stats ?? [])
        .filter((stat) => isCompanyStatKey(stat.key))
        .map(
          (stat): CompanyStat => ({
            key: stat.key as CompanyStatKey,
            value: stat.value,
            sparkline: (stat.sparkline ?? []).map((point) => ({
              date: point.date,
              value: point.value,
            })),
          }),
        ),
      items: (dto.items ?? []).map((item) => companyAdapter.toManagedCompany(item)),
    }
  },

  toCreateRequest(
    values: CompanyFormValues,
    uploadedFiles: Partial<Record<'logo' | 'commercialRegistration', UploadedFile>>,
    options?: { parentCompanyId?: string },
  ): CompanyCreateRequestDto {
    const payload: CompanyCreateRequestDto = {
      businessName: values.businessName,
      mainContactPerson: values.mainContactPerson,
      phone: values.phone,
      photo: uploadedFiles.logo?.filePath ?? '',
      email: values.email,
      password: values.password,
      type: values.businessType,
      address: values.address,
      googleMapLink: values.googleMapLink,
      commercialRegistration: uploadedFiles.commercialRegistration?.filePath ?? null,
    }

    if (options?.parentCompanyId) {
      payload.parentCompanyId = options.parentCompanyId
    }

    return payload
  },

  toUpdateRequest(
    values: CompanyFormValues,
    uploadedFiles: Partial<Record<'logo' | 'commercialRegistration', UploadedFile>>,
    existingFilePaths?: Partial<Record<'logo' | 'commercialRegistration', string | null>>,
  ): CompanyUpdateRequestDto {
    const payload: CompanyUpdateRequestDto = {
      businessName: values.businessName,
      mainContactPerson: values.mainContactPerson,
      phone: values.phone,
      photo: toWriteFilePath('logo', uploadedFiles, existingFilePaths) ?? '',
      email: values.email,
      type: values.businessType,
      address: values.address,
      googleMapLink: values.googleMapLink,
      commercialRegistration: toWriteFilePath(
        'commercialRegistration',
        uploadedFiles,
        existingFilePaths,
      ),
    }

    if (values.password.trim()) {
      payload.password = values.password.trim()
    }

    return payload
  },

  toEditDetails(dto: CompanyForEditDto): CompanyEditDetails {
    return {
      id: dto.id,
      slug: dto.slug,
      businessName: dto.businessName,
      mainContactPerson: dto.mainContactPerson,
      phone: dto.phone,
      photo: toRemoteFileReference(dto.photo),
      email: dto.email,
      type: dto.type,
      address: dto.address,
      googleMapLink: dto.googleMapLink,
      commercialRegistration: toRemoteFileReference(dto.commercialRegistration),
      parentCompanyId: dto.parentCompanyId ?? null,
      isActive: dto.isActive ?? true,
    }
  },

  toCompanyActivity(dto: CompanyProfileActivityDto): CompanyActivity {
    return {
      id: dto.id,
      type: parseActivityType(dto.type),
      title: dto.title,
      description: dto.description,
      user: dto.performedBy,
      timestamp: dto.occurredAt,
    }
  },

  toCompanyOrder(dto: CompanyProfileOrderDto | CompanyProfileRecentOrderDto): CompanyOrder {
    const pickupAt = 'pickupAt' in dto ? dto.pickupAt : ''
    const createdAt = 'createdAt' in dto ? dto.createdAt : pickupAt

    return {
      id: dto.id,
      orderNumber: dto.orderNumber,
      branchId: '',
      branchSlug: '',
      branchName: dto.branchName,
      status: parseOrderStatus(dto.status),
      itemsCount: dto.itemsCount,
      bagsCount: 0,
      pickupDate: pickupAt,
      deliveryDate: createdAt,
    }
  },

  toCompanyInvoice(
    dto: CompanyProfileInvoiceDto | CompanyProfileRecentInvoiceDto,
    branchName = '',
  ): CompanyInvoice {
    const status = parseInvoiceStatus(dto.paymentStatus)
    const createdAt = 'createdAt' in dto ? dto.createdAt : dto.dueDate
    const resolvedBranchName = 'branchName' in dto ? dto.branchName : branchName

    return {
      id: dto.id,
      invoiceNumber: dto.invoiceNumber,
      branchId: '',
      branchSlug: '',
      branchName: resolvedBranchName,
      invoiceDate: createdAt,
      dueDate: dto.dueDate,
      amount: dto.amount,
      paidAmount: status === 'paid' ? dto.amount : 0,
      status,
    }
  },

  toCompanyBranch(dto: CompanyProfileBranchDto): CompanyDetailsBranch {
    return {
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      managerName: '—',
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      googleMapsLink: '',
      status: dto.isActive ? 'active' : 'inactive',
      activeOrders: dto.activeOrders,
      completedOrders: 0,
      ordersThisMonth: 0,
      outstandingBalance: 0,
      overdueOrders: 0,
      pendingInvoices: 0,
    }
  },

  toCompanyProfile(dto: CompanyProfileDto): CompanyDetailsData {
    const photo = toRemoteFileReference(dto.photo)
    const { business, contact, location, status: statusInfo } = dto.companyInfo
    const { invoiceCounts, totals } = dto.financialSummary

    const financials: CompanyFinancials = {
      totalInvoices: invoiceCounts.total,
      paidInvoices: invoiceCounts.paid,
      pendingInvoices: invoiceCounts.pending,
      overdueInvoices: invoiceCounts.overdue,
      totalBilledAmount: totals.totalBilled,
      totalPaidAmount: totals.totalPaid,
      outstandingBalance: totals.outstanding,
      collectionRate: totals.collectionRate,
    }

    return {
      id: dto.id,
      slug: dto.slug,
      name: dto.name,
      type: dto.type,
      email: contact.email,
      phone: contact.phone,
      logoUrl: photo?.url ?? null,
      commercialRegistration: business.commercialRegistration ?? '',
      address: location.address,
      googleMapsLink: location.googleMapLink ?? '',
      status: parseStatus(dto.status),
      isActive: dto.isActive,
      createdAt: statusInfo.registrationDate,
      responsible: {
        id: dto.id,
        fullName: contact.mainContactPerson,
        email: contact.email,
        phone: contact.phone,
      },
      stats: {
        branches: dto.stats.branchesCount,
        activeOrders: dto.stats.activeOrders,
        completedOrders: dto.stats.completedOrders,
        ordersThisMonth: dto.stats.ordersThisMonth,
        outstandingBalance: dto.stats.outstandingBalance,
        totalRevenue: dto.stats.totalRevenue,
        pendingInvoices: dto.stats.pendingInvoices,
        overdueInvoices: dto.stats.overdueInvoices,
      },
      financials,
      alerts: buildAlerts(dto.stats, dto.alertsCount),
      branches: [],
      invoices: (dto.financialSummary.recentInvoices ?? []).map((invoice) =>
        companyAdapter.toCompanyInvoice(invoice),
      ),
      recentOrders: (dto.recentOrders ?? []).map((order) => companyAdapter.toCompanyOrder(order)),
      activities: (dto.recentActivity ?? []).map((activity) =>
        companyAdapter.toCompanyActivity(activity),
      ),
    }
  },
}
