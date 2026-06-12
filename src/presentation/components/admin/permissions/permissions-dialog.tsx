import { Plus } from 'lucide-react'
import { useMemo } from 'react'

import {
  PERMISSION_GROUPS,
  type PermissionGroupKey,
} from '@/domain/constants/permission-groups'
import type { Permission } from '@/domain/types/permission.type'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { PermissionGroupAccordion } from './permission-group-accordion'

export interface PermissionsDialogLabels {
  permissionUsersView: string
  permissionUsersCreate: string
  permissionRolesView: string
  permissionRolesCreate: string
  permissionBranchesView: string
  permissionBranchesCreate: string
  permissionOrdersView: string
  permissionOrdersUpdate: string
  permissionLaundryView: string
  permissionCustomersView: string
  permissionSettingsView: string
  groupUsers: string
  groupRoles: string
  groupBranches: string
  groupOrders: string
  groupLaundry: string
  groupCustomers: string
  groupSettings: string
  permissionSettingsFor: string
  groupEmpty: string
  addPermission: string
}

const permissionLabelKey: Record<Permission, keyof PermissionsDialogLabels> = {
  'users.view': 'permissionUsersView',
  'users.create': 'permissionUsersCreate',
  'roles.view': 'permissionRolesView',
  'roles.create': 'permissionRolesCreate',
  'branches.view': 'permissionBranchesView',
  'branches.create': 'permissionBranchesCreate',
  'orders.view': 'permissionOrdersView',
  'orders.update': 'permissionOrdersUpdate',
  'laundry.view': 'permissionLaundryView',
  'customers.view': 'permissionCustomersView',
  'settings.view': 'permissionSettingsView',
}

const groupLabelKey: Record<PermissionGroupKey, keyof PermissionsDialogLabels> = {
  users: 'groupUsers',
  roles: 'groupRoles',
  branches: 'groupBranches',
  orders: 'groupOrders',
  laundry: 'groupLaundry',
  customers: 'groupCustomers',
  settings: 'groupSettings',
}

export interface PermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  permissions: Permission[]
  labels: PermissionsDialogLabels
  onAddPermission?: () => void
}

export const PermissionsDialog = ({
  open,
  onOpenChange,
  title,
  description,
  permissions,
  labels,
  onAddPermission,
}: PermissionsDialogProps) => {
  const permissionSet = useMemo(() => new Set(permissions), [permissions])

  const groups = useMemo(
    () =>
      PERMISSION_GROUPS.map((group) => ({
        key: group.key,
        title: labels[groupLabelKey[group.key]],
        subtitle: labels.permissionSettingsFor.replace(
          '{{group}}',
          labels[groupLabelKey[group.key]],
        ),
        groupLabel: labels[groupLabelKey[group.key]].toUpperCase(),
        items: group.permissions
          .filter((permission) => permissionSet.has(permission))
          .map((permission) => ({
            permission,
            label: labels[permissionLabelKey[permission]],
          })),
      })),
    [labels, permissionSet],
  )

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="lg"
      bodyClassName="space-y-3"
      footer={
        <Button className="w-full sm:w-auto" onClick={onAddPermission}>
          <Plus />
          {labels.addPermission}
        </Button>
      }
    >
      {groups.map((group, index) => (
        <PermissionGroupAccordion
          key={group.key}
          title={group.title}
          subtitle={group.subtitle}
          groupLabel={group.groupLabel}
          items={group.items}
          emptyLabel={labels.groupEmpty}
          defaultOpen={index === 0}
        />
      ))}
    </AppDialog>
  )
}
