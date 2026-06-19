export interface CreateRoleRequestDto {
  name: string
  description: string
  isActive: boolean
  permissionIds: string[]
}
