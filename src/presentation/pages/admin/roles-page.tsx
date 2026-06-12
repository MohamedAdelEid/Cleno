import { Plus, Shield } from 'lucide-react'

import { notify } from '@/infrastructure/libs/toast/toast'
import { PageHeader } from '@/presentation/components/layout'
import { RolesTableSection } from '@/presentation/components/admin/roles'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const RolesPage = () => {
  const { t } = useTranslation('roles')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={Shield}
        action={
          <Button
            onClick={() =>
              notify.info({
                title: t('addRole'),
                description: t('addRoleComingSoon'),
              })
            }
          >
            <Plus />
            {t('addRole')}
          </Button>
        }
      />
      <RolesTableSection />
    </div>
  )
}
