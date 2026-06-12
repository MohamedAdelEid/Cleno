import { Permission } from '@/domain/constants/permissions'
import type { ManagedRole, RoleMember } from '@/domain/entities'
import { RoleStatus } from '@/domain/enums'

export const assignableUsersDummyData: RoleMember[] = [
  {
    id: 'u-101',
    fullName: 'Sara Al-Harbi',
    email: 'sara.alharbi@cleno.app',
    avatarUrl: null,
  },
  {
    id: 'u-102',
    fullName: 'Omar Khalid',
    email: 'omar.khalid@cleno.app',
    avatarUrl: null,
  },
  {
    id: 'u-103',
    fullName: 'Layla Mansour',
    email: 'layla.mansour@cleno.app',
    avatarUrl: null,
  },
  {
    id: 'u-104',
    fullName: 'Youssef Nabil',
    email: 'youssef.nabil@cleno.app',
    avatarUrl: null,
  },
  {
    id: 'u-105',
    fullName: 'Nour El-Din',
    email: 'nour.eldin@cleno.app',
    avatarUrl: null,
  },
  {
    id: 'u-106',
    fullName: 'Hana Saleh',
    email: 'hana.saleh@cleno.app',
    avatarUrl: null,
  },
  {
    id: 'u-107',
    fullName: 'Karim Farouk',
    email: 'karim.farouk@cleno.app',
    avatarUrl: null,
  },
  {
    id: 'u-108',
    fullName: 'Maya Hassan',
    email: 'maya.hassan@cleno.app',
    avatarUrl: null,
  },
]

export const rolesDummyData: ManagedRole[] = [
  {
    id: 'role-1',
    name: 'Branch Manager',
    description:
      'Oversees daily branch operations, staff scheduling, and customer escalations across assigned locations.',
    permissions: [
      Permission.BranchesView,
      Permission.OrdersView,
      Permission.OrdersUpdate,
      Permission.UsersView,
      Permission.CustomersView,
    ],
    users: assignableUsersDummyData.slice(0, 5),
    status: RoleStatus.Active,
    createdAt: '2025-11-12T09:30:00.000Z',
  },
  {
    id: 'role-2',
    name: 'Operations Admin',
    description:
      'Full administrative access to users, roles, branches, and system configuration with audit visibility.',
    permissions: [
      Permission.UsersView,
      Permission.UsersCreate,
      Permission.RolesView,
      Permission.RolesCreate,
      Permission.BranchesView,
      Permission.BranchesCreate,
      Permission.SettingsView,
    ],
    users: assignableUsersDummyData.slice(2, 4),
    status: RoleStatus.Active,
    createdAt: '2025-10-03T14:15:00.000Z',
  },
  {
    id: 'role-3',
    name: 'Laundry Supervisor',
    description:
      'Manages laundry floor workflow, bag tracking, and order status updates for in-progress items.',
    permissions: [Permission.LaundryView, Permission.OrdersView, Permission.OrdersUpdate],
    users: assignableUsersDummyData.slice(4, 7),
    status: RoleStatus.Active,
    createdAt: '2026-01-08T11:00:00.000Z',
  },
  {
    id: 'role-4',
    name: 'Customer Support',
    description:
      'Handles customer inquiries, order lookups, and incident reporting without access to sensitive admin settings.',
    permissions: [Permission.CustomersView, Permission.OrdersView],
    users: assignableUsersDummyData.slice(0, 2),
    status: RoleStatus.Inactive,
    createdAt: '2025-09-21T16:45:00.000Z',
  },
  {
    id: 'role-5',
    name: 'Read-only Auditor',
    description:
      'View-only role for compliance reviews across users, branches, orders, and laundry activity logs.',
    permissions: [
      Permission.UsersView,
      Permission.BranchesView,
      Permission.OrdersView,
      Permission.LaundryView,
      Permission.CustomersView,
    ],
    users: assignableUsersDummyData.slice(7, 8),
    status: RoleStatus.Active,
    createdAt: '2026-02-14T08:20:00.000Z',
  },
  {
    id: 'role-6',
    name: 'Delivery Coordinator',
    description:
      'Coordinates driver assignments, route planning, and delivery status updates for outgoing orders.',
    permissions: [Permission.OrdersView, Permission.OrdersUpdate, Permission.CustomersView],
    users: assignableUsersDummyData.slice(1, 3),
    status: RoleStatus.Active,
    createdAt: '2025-12-01T10:00:00.000Z',
  },
  {
    id: 'role-7',
    name: 'Finance Viewer',
    description:
      'Read-only access to billing summaries, outstanding invoices, and payment status across branches.',
    permissions: [Permission.OrdersView, Permission.CustomersView, Permission.SettingsView],
    users: assignableUsersDummyData.slice(5, 6),
    status: RoleStatus.Inactive,
    createdAt: '2025-08-15T13:30:00.000Z',
  },
  {
    id: 'role-8',
    name: 'Inventory Clerk',
    description:
      'Tracks bag circulation, supply levels, and branch inventory movements with limited order visibility.',
    permissions: [Permission.LaundryView, Permission.BranchesView],
    users: assignableUsersDummyData.slice(3, 5),
    status: RoleStatus.Active,
    createdAt: '2026-01-20T09:15:00.000Z',
  },
  {
    id: 'role-9',
    name: 'Regional Manager',
    description:
      'Multi-branch oversight with access to performance metrics, staffing, and escalated customer issues.',
    permissions: [
      Permission.BranchesView,
      Permission.BranchesCreate,
      Permission.UsersView,
      Permission.OrdersView,
      Permission.CustomersView,
    ],
    users: assignableUsersDummyData.slice(0, 4),
    status: RoleStatus.Active,
    createdAt: '2025-07-04T08:00:00.000Z',
  },
  {
    id: 'role-10',
    name: 'Guest Access',
    description:
      'Minimal permissions for temporary or trial accounts with restricted visibility across the platform.',
    permissions: [Permission.OrdersView],
    users: [],
    status: RoleStatus.Inactive,
    createdAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: 'role-11',
    name: 'Quality Inspector',
    description:
      'Reviews completed laundry items, flags quality issues, and updates order notes before dispatch.',
    permissions: [Permission.LaundryView, Permission.OrdersView, Permission.OrdersUpdate],
    users: assignableUsersDummyData.slice(6, 8),
    status: RoleStatus.Active,
    createdAt: '2026-02-28T15:45:00.000Z',
  },
  {
    id: 'role-12',
    name: 'System Integrator',
    description:
      'Technical role for API integrations, webhook configuration, and third-party service connections.',
    permissions: [Permission.SettingsView, Permission.OrdersView, Permission.UsersView],
    users: assignableUsersDummyData.slice(0, 1),
    status: RoleStatus.Active,
    createdAt: '2025-11-30T17:20:00.000Z',
  },
]
