export interface PermissionItemDto {
  id: string
  name: string
  action: string
}

export interface PermissionModuleDto {
  module: string
  permissions: PermissionItemDto[]
}
