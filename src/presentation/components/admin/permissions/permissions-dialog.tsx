import { Plus } from 'lucide-react'
import { useMemo } from 'react'

import { PERMISSION_GROUPS } from '@/domain/constants/permission-groups'
import type { Permission } from '@/domain/types/permission.type'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import {
  getGroupLabel,
  getPermissionLabel,
  type PermissionLabels,
} from './permission-labels'
import { PermissionGroup } from './permission-group'

export type PermissionsDialogLabels = PermissionLabels & {
  addPermission: string
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
  const permissionLabels = useMemo(
    () =>
      Object.fromEntries(
        PERMISSION_GROUPS.flatMap((group) =>
          group.permissions.map((permission) => [
            permission,
            getPermissionLabel(permission, labels),
          ]),
        ),
      ) as Record<Permission, string>,
    [labels],
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
      {PERMISSION_GROUPS.map((group, index) => (
        <PermissionGroup
          key={group.key}
          title={getGroupLabel(group.key, labels)}
          subtitle={labels.permissionSettingsFor.replace(
            '{{group}}',
            getGroupLabel(group.key, labels),
          )}
          items={group.permissions.map((permission) => ({
            id: permission,
            label: permissionLabels[permission],
          }))}
          selectedIds={permissions}
          selectAllLabel={labels.selectAll}
          emptyLabel={labels.groupEmpty}
          defaultOpen={index === 0}
          readOnly
        />
      ))}
    </AppDialog>
  )
}
