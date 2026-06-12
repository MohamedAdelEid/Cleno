import type { Namespace } from '@/infrastructure/libs/i18n/namespaces'
import { auth } from './auth'
import { common } from './common'
import { dashboard } from './dashboard'
import { navigation } from './navigation'
import { roles } from './roles'

export const ar: Partial<Record<Namespace, Record<string, string>>> = {
  common,
  auth,
  navigation,
  dashboard,
  roles,
}
