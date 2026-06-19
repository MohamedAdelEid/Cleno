import { z } from 'zod'

import { RoleStatus } from '@/domain/enums'

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
    permissionIds: z.array(z.string().uuid()).min(1, messages.permissionsRequired),
  })

export type RoleFormValues = z.infer<ReturnType<typeof createRoleFormSchema>>

export const emptyRoleFormValues: RoleFormValues = {
  name: '',
  description: '',
  status: RoleStatus.Active,
  permissionIds: [],
}
