import { useMemo } from 'react'

import { buildPermissionDialogLabels } from '@/presentation/components/admin/permissions/permission-labels'
import type { PermissionsDialogLabels } from '@/presentation/components/admin/permissions'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const usePermissionDialogLabels = (): PermissionsDialogLabels => {
  const { t } = useTranslation('roles')

  return useMemo(() => buildPermissionDialogLabels(t), [t])
}
