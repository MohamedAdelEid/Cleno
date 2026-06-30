export interface ManagedIncidentOrder {
  slug: string
  number: string
  status: number
  statusLabel: string
}

export interface ManagedIncidentCompany {
  slug: string
  name: string
}

export interface ManagedIncidentBranch {
  slug: string
  name: string
}

export interface ManagedIncident {
  id: string
  slug: string
  type: number
  typeLabel: string
  stage: number
  stageLabel: string
  title: string
  description: string
  createdAt: string
  reporterName: string
  replyCount: number
  isOpen: boolean
  order: ManagedIncidentOrder
  company: ManagedIncidentCompany
  branch: ManagedIncidentBranch
}

export interface ManagedIncidentReply {
  id: string
  message: string
  authorName: string
  createdAt: string
}

export interface ManagedIncidentDetail extends ManagedIncident {
  orderSlug: string
  replies: ManagedIncidentReply[]
}

export interface ManagedIncidentStats {
  total: number
  open: number
  closed: number
}

export interface ManagedIncidentStatTrends {
  total: number[]
  open: number[]
  closed: number[]
}
