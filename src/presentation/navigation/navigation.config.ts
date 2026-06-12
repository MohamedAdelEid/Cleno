import {
  Building2,
  LayoutDashboard,
  Settings,
  Shirt,
  ShoppingBag,
  Shield,
  Users,
  UserRound,
} from 'lucide-react'
import { Permission } from '@/domain/constants'
import { ROUTES } from '@/presentation/routes/routes.constants'
import type { NavigationGroup } from './navigation.types'

export const navigationConfig: NavigationGroup[] = [
  {
    titleKey: 'mainNavigation',
    items: [
      {
        titleKey: 'dashboard',
        href: ROUTES.DASHBOARD.HOME,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    titleKey: 'management',
    items: [
      {
        titleKey: 'usersAndRoles',
        icon: Users,
        children: [
          {
            titleKey: 'userManagement',
            href: ROUTES.USERS.INDEX,
            icon: UserRound,
            permissions: [Permission.UsersView],
          },
          {
            titleKey: 'roleManagement',
            href: ROUTES.ROLES.INDEX,
            icon: Shield,
            permissions: [Permission.RolesView],
          },
        ],
      },
      {
        titleKey: 'branches',
        href: ROUTES.BRANCHES.INDEX,
        icon: Building2,
        permissions: [Permission.BranchesView],
      },
    ],
  },
  {
    titleKey: 'operations',
    items: [
      {
        titleKey: 'orders',
        href: ROUTES.ORDERS.INDEX,
        icon: ShoppingBag,
        permissions: [Permission.OrdersView],
      },
      {
        titleKey: 'laundry',
        href: ROUTES.LAUNDRY.INDEX,
        icon: Shirt,
        permissions: [Permission.LaundryView],
      },
      {
        titleKey: 'customers',
        href: ROUTES.CUSTOMERS.INDEX,
        icon: UserRound,
        permissions: [Permission.CustomersView],
      },
    ],
  },
  {
    placement: 'footer',
    items: [
      {
        titleKey: 'settings',
        href: ROUTES.SETTINGS.INDEX,
        icon: Settings,
        permissions: [Permission.SettingsView],
      },
    ],
  },
]
