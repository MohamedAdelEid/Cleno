import type { Namespace } from '@/infrastructure/libs/i18n/namespaces'
import { auth } from './auth'
import { common } from './common'
import { dashboard } from './dashboard'
import { navigation } from './navigation'
import { roles } from './roles'
import { companies } from './companies'
import { orders } from './orders'
import { laundry } from './laundry'

export const ar: Partial<Record<Namespace, Record<string, string>>> = {
  common,
  auth,
  navigation,
  dashboard,
  roles,
  companies,
  orders,
  laundry,
}
