import {
  Building,
  Clock,
  LayoutDashboard,
  Package,
  Settings,
  Shirt,
  ShoppingBag,
  Shield,
  Tags,
  TriangleAlert,
  Truck,
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
        titleKey: 'incidents',
        href: ROUTES.INCIDENTS.INDEX,
        icon: TriangleAlert,
        permissions: [Permission.LaundryView],
      },
      {
        titleKey: 'operationalBags',
        href: ROUTES.OPERATIONAL_BAGS.INDEX,
        icon: Package,
        permissions: [Permission.BagsView],
      },
      {
        titleKey: 'drivers',
        href: ROUTES.DRIVERS.INDEX,
        icon: Truck,
        permissions: [Permission.OrdersView],
      },
      {
        titleKey: 'companies',
        href: ROUTES.COMPANIES.INDEX,
        icon: Building,
        permissions: [Permission.CustomersView],
      },
      {
        titleKey: 'timeSlots',
        href: ROUTES.TIME_SLOTS.INDEX,
        icon: Clock,
        permissions: [Permission.SettingsView],
      },
      {
        titleKey: 'laundryItems',
        href: ROUTES.LAUNDRY_ITEMS.INDEX,
        icon: Tags,
        permissions: [Permission.SettingsView],
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
