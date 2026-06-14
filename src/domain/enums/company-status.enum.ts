export const CompanyAccountStatus = {
  PendingEmailVerification: 'pending_email_verification',
  PendingAdminApproval: 'pending_admin_approval',
  Approved: 'approved',
  Rejected: 'rejected',
  Suspended: 'suspended',
} as const

export type CompanyAccountStatus = (typeof CompanyAccountStatus)[keyof typeof CompanyAccountStatus]

export const COMPANY_ACCOUNT_STATUSES = Object.values(CompanyAccountStatus)

export const COMPANY_CHANGEABLE_STATUSES = [
  CompanyAccountStatus.PendingAdminApproval,
  CompanyAccountStatus.Approved,
  CompanyAccountStatus.Rejected,
  CompanyAccountStatus.Suspended,
] as const
