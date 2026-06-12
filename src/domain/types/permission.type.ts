import type { Permission as PermissionMap } from '@/domain/constants/permissions'

export type Permission = (typeof PermissionMap)[keyof typeof PermissionMap]
