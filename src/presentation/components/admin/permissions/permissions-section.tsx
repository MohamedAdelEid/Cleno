import { useMemo } from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { PERMISSION_GROUPS } from '@/domain/constants/permission-groups'
import type { RoleFormValues } from '@/domain/schemas'
import type { Permission } from '@/domain/types/permission.type'
import { FormSection } from '@/presentation/components/forms'
import { FieldError } from '@/presentation/components/ui/field'
import {
  getGroupLabel,
  getPermissionLabel,
  type PermissionLabels,
} from './permission-labels'
import { PermissionGroup } from './permission-group'

interface PermissionsSectionProps {
  control: Control<RoleFormValues>
  labels: PermissionLabels & {
    sectionTitle: string
    sectionDescription: string
    selectAll: string
  }
}

export const PermissionsSection = ({ control, labels }: PermissionsSectionProps) => {
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
    <FormSection title={labels.sectionTitle} description={labels.sectionDescription} variant="panel">
      <Controller
        control={control}
        name="permissions"
        render={({ field, fieldState }) => (
          <div className="space-y-3">
            {PERMISSION_GROUPS.map((group, index) => (
              <PermissionGroup
                key={group.key}
                title={getGroupLabel(group.key, labels)}
                subtitle={labels.permissionSettingsFor.replace(
                  '{{group}}',
                  getGroupLabel(group.key, labels),
                )}
                permissions={group.permissions}
                permissionLabels={permissionLabels}
                selectedPermissions={field.value}
                onChange={field.onChange}
                selectAllLabel={labels.selectAll}
                emptyLabel={labels.groupEmpty}
                defaultOpen={index === 0}
              />
            ))}
            <FieldError message={fieldState.error?.message} />
          </div>
        )}
      />
    </FormSection>
  )
}
