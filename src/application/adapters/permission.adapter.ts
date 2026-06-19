import type { PermissionModuleGroup } from '@/domain/entities'
import type { PermissionModuleDto } from '@/application/dtos/permissions/permissions.dto'

export const permissionAdapter = {
  toModuleGroups(dto: PermissionModuleDto[]): PermissionModuleGroup[] {
    return dto.map((group) => ({
      module: group.module,
      permissions: group.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        action: permission.action,
      })),
    }))
  },
}
