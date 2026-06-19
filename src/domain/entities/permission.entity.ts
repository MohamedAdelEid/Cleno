export interface PermissionItem {
  id: string
  name: string
  action: string
}

export interface PermissionModuleGroup {
  module: string
  permissions: PermissionItem[]
}
