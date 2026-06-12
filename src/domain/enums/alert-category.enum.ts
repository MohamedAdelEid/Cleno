export const AlertCategory = {
  DelayedOrder: 'delayed_order',
  IssueReported: 'issue_reported',
  OpenIncident: 'open_incident',
} as const

export type AlertCategory = (typeof AlertCategory)[keyof typeof AlertCategory]
