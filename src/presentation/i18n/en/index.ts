import type { Namespace } from '@/infrastructure/libs/i18n/namespaces'
import { auth } from './auth'
import { common } from './common'
import { dashboard } from './dashboard'
import { navigation } from './navigation'
import { roles } from './roles'
import { companies } from './companies'
import { orders } from './orders'
import { laundry } from './laundry'
import { operationalBags } from './operational-bags'
import { users } from './users'
import { drivers } from './drivers'
import { incidents } from './incidents'
import { timeSlots } from './time-slots'
import { laundryItems } from './laundry-items'

export const en: Partial<Record<Namespace, Record<string, string>>> = {
  common,
  auth,
  navigation,
  dashboard,
  roles,
  companies,
  orders,
  laundry,
  operationalBags,
  users,
  drivers,
  incidents,
  timeSlots,
  laundryItems,
}
