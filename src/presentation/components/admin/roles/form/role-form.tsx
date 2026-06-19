import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'

import {
  createRoleFormSchema,
  emptyRoleFormValues,
  type RoleFormValues,
} from '@/domain/schemas'
import type { PermissionModuleGroup } from '@/domain/entities'
import { PermissionsSection } from '@/presentation/components/admin/permissions'
import type { PermissionLabels } from '@/presentation/components/admin/permissions'
import { Button } from '@/presentation/components/ui/button'
import { fadeUp } from '@/presentation/utils/motion'
import { RoleDetailsSection } from './role-details-section'

export interface RoleFormLabels extends PermissionLabels {
  addTitle: string
  editTitle: string
  addSubtitle: string
  editSubtitle: string
  discard: string
  saveChanges: string
  detailsTitle: string
  detailsDescription: string
  formRoleName: string
  formDescription: string
  formStatus: string
  statusActive: string
  statusInactive: string
  permissionsTitle: string
  permissionsDescription: string
  selectAll: string
  validationNameRequired: string
  validationNameMin: string
  validationNameMax: string
  validationDescriptionRequired: string
  validationDescriptionMin: string
  validationDescriptionMax: string
  validationPermissionsRequired: string
  permissionsLoadError: string
}

export interface RoleFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<RoleFormValues>
  labels: RoleFormLabels
  permissionGroups: PermissionModuleGroup[]
  permissionsLoading?: boolean
  permissionsLoadError?: string | null
  onSubmit: (values: RoleFormValues) => Promise<void> | void
  onDiscard: () => void
}

export const RoleForm = ({
  mode,
  defaultValues,
  labels,
  permissionGroups,
  permissionsLoading = false,
  permissionsLoadError = null,
  onSubmit,
  onDiscard,
}: RoleFormProps) => {
  const schema = useMemo(
    () =>
      createRoleFormSchema({
        nameRequired: labels.validationNameRequired,
        nameMin: labels.validationNameMin,
        nameMax: labels.validationNameMax,
        descriptionRequired: labels.validationDescriptionRequired,
        descriptionMin: labels.validationDescriptionMin,
        descriptionMax: labels.validationDescriptionMax,
        permissionsRequired: labels.validationPermissionsRequired,
      }),
    [labels],
  )

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...emptyRoleFormValues,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <motion.div
        {...fadeUp(0)}
        className="sticky top-0 z-10 -mx-1 flex flex-col gap-4 border-b border-border/60 bg-background/90 px-1 pb-5 backdrop-blur-md sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === 'create' ? labels.addTitle : labels.editTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'create' ? labels.addSubtitle : labels.editSubtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start">
          <Button type="button" variant="outline" onClick={onDiscard} disabled={isSubmitting}>
            {labels.discard}
          </Button>
          <Button type="submit" disabled={isSubmitting || permissionsLoading || !!permissionsLoadError}>
            {labels.saveChanges}
          </Button>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.08)}>
        <RoleDetailsSection
          control={control}
          labels={{
            sectionTitle: labels.detailsTitle,
            sectionDescription: labels.detailsDescription,
            roleName: labels.formRoleName,
            description: labels.formDescription,
            status: labels.formStatus,
            statusActive: labels.statusActive,
            statusInactive: labels.statusInactive,
          }}
        />
      </motion.div>

      <motion.div {...fadeUp(0.14)}>
        <PermissionsSection
          control={control}
          groups={permissionGroups}
          isLoading={permissionsLoading}
          loadError={permissionsLoadError}
          labels={{
            sectionTitle: labels.permissionsTitle,
            sectionDescription: labels.permissionsDescription,
            selectAll: labels.selectAll,
            groupEmpty: labels.groupEmpty,
            permissionSettingsFor: labels.permissionSettingsFor,
            permissionsLoadError: labels.permissionsLoadError,
          }}
        />
      </motion.div>
    </form>
  )
}
