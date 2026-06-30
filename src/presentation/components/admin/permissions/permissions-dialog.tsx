import { Plus } from 'lucide-react'
import { useMemo } from 'react'

import { PERMISSION_GROUPS } from '@/domain/constants/permission-groups'
import type { PermissionModuleGroup } from '@/domain/entities'
import type { Permission } from '@/domain/types/permission.type'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { getGroupLabel, getPermissionLabel, type PermissionLabels } from './permission-labels'
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
  groups?: PermissionModuleGroup[]
  isLoading?: boolean
  labels: PermissionsDialogLabels
  onAddPermission?: () => void
}

export const PermissionsDialog = ({
  open,
  onOpenChange,
  title,
  description,
  permissions,
  groups,
  isLoading = false,
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
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 rounded-lg bg-muted/40" />
          ))}
        </div>
      ) : groups?.length ? (
        groups.map((group, index) => (
          <PermissionGroup
            key={group.module}
            title={group.module}
            subtitle={labels.permissionSettingsFor.replace('{{group}}', group.module)}
            items={group.permissions.map((permission) => ({
              id: permission.id,
              label: permission.name,
            }))}
            selectedIds={group.permissions.map((permission) => permission.id)}
            selectAllLabel={labels.selectAll}
            emptyLabel={labels.groupEmpty}
            defaultOpen={index === 0}
            readOnly
          />
        ))
      ) : (
        PERMISSION_GROUPS.map((group, index) => (
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
        ))
      )}
    </AppDialog>
  )
}
