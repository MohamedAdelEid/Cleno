import { z } from 'zod'

import { Permission } from '@/domain/constants/permissions'
import { RoleStatus } from '@/domain/enums'
import type { Permission as PermissionType } from '@/domain/types/permission.type'

const permissionValues = Object.values(Permission) as [
  PermissionType,
  ...PermissionType[],
]

const roleStatusValues = [RoleStatus.Active, RoleStatus.Inactive] as [
  RoleStatus,
  RoleStatus,
]

export const createRoleFormSchema = (messages: {
  nameRequired: string
  nameMin: string
  nameMax: string
  descriptionRequired: string
  descriptionMin: string
  descriptionMax: string
  permissionsRequired: string
}) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin)
      .max(80, messages.nameMax),
    description: z
      .string()
      .trim()
      .min(1, messages.descriptionRequired)
      .min(10, messages.descriptionMin)
      .max(500, messages.descriptionMax),
    status: z.enum(roleStatusValues),
    permissions: z
      .array(z.enum(permissionValues))
      .min(1, messages.permissionsRequired),
  })

export type RoleFormValues = z.infer<ReturnType<typeof createRoleFormSchema>>

export const emptyRoleFormValues: RoleFormValues = {
  name: '',
  description: '',
  status: RoleStatus.Active,
  permissions: [],
}
