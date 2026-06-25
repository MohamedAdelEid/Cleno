export const Permission = {
  UsersView: 'users.view',
  UsersCreate: 'users.create',
  RolesView: 'roles.view',
  RolesCreate: 'roles.create',
  BranchesView: 'branches.view',
  BranchesCreate: 'branches.create',
  OrdersView: 'orders.view',
  OrdersUpdate: 'orders.update',
  LaundryView: 'laundry.view',
  BagsView: 'bags.view',
  CustomersView: 'customers.view',
  SettingsView: 'settings.view',
} as const

export const ALL_PERMISSIONS = Object.values(Permission)
