import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'

import type { PermissionModuleGroup } from '@/domain/entities'
import type { RoleFormValues } from '@/domain/schemas'
import { FormSection } from '@/presentation/components/forms'
import { FieldError } from '@/presentation/components/ui/field'
import { PAGE_EASE } from '@/presentation/utils/motion'
import { PermissionGroup } from './permission-group'
import { PermissionsSkeleton } from './permissions-skeleton'

interface PermissionsSectionProps {
  control: Control<RoleFormValues>
  groups: PermissionModuleGroup[]
  labels: {
    sectionTitle: string
    sectionDescription: string
    selectAll: string
    groupEmpty: string
    permissionSettingsFor: string
    permissionsLoadError: string
  }
  isLoading?: boolean
  loadError?: string | null
}

export const PermissionsSection = ({
  control,
  groups,
  labels,
  isLoading = false,
  loadError = null,
}: PermissionsSectionProps) => (
  <FormSection title={labels.sectionTitle} description={labels.sectionDescription} variant="panel">
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="permissions-skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <PermissionsSkeleton />
        </motion.div>
      ) : loadError ? (
        <motion.p
          key="permissions-error"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: PAGE_EASE }}
          className="text-sm text-destructive"
        >
          {loadError || labels.permissionsLoadError}
        </motion.p>
      ) : (
        <motion.div
          key="permissions-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: PAGE_EASE }}
        >
          <Controller
            control={control}
            name="permissionIds"
            render={({ field, fieldState }) => (
              <div className="space-y-3">
                {groups.map((group, index) => (
                  <motion.div
                    key={group.module}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, ease: PAGE_EASE, delay: index * 0.04 }}
                  >
                    <PermissionGroup
                      title={group.module}
                      subtitle={labels.permissionSettingsFor.replace('{{group}}', group.module)}
                      items={group.permissions.map((permission) => ({
                        id: permission.id,
                        label: permission.name,
                      }))}
                      selectedIds={field.value}
                      onChange={field.onChange}
                      selectAllLabel={labels.selectAll}
                      emptyLabel={labels.groupEmpty}
                      defaultOpen={index === 0}
                    />
                  </motion.div>
                ))}
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </FormSection>
)
