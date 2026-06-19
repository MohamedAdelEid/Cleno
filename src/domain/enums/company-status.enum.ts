export const CompanyAccountStatus = {
  PendingEmailVerification: 1,
  PendingAdminApproval: 2,
  Approved: 3,
  Rejected: 4,
} as const

export type CompanyAccountStatus = (typeof CompanyAccountStatus)[keyof typeof CompanyAccountStatus]

export const COMPANY_ACCOUNT_STATUSES = Object.values(CompanyAccountStatus)
