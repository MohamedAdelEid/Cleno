import { DriverStatus } from '@/domain/enums'
import type { ActiveDriver } from '@/domain/entities'

export const activeDriversDummyData: ActiveDriver[] = [
  {
    id: 'drv-3',
    fullName: 'Khalid Hassan',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Khalid',
    status: DriverStatus.OnTask,
    activeTask: 'ORD-2841',
    taskCount: 1,
  },
  {
    id: 'drv-1',
    fullName: 'Youssef Ali',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Youssef',
    status: DriverStatus.OnTask,
    activeTask: 'ORD-2835',
    taskCount: 2,
  },
  {
    id: 'drv-2',
    fullName: 'Faisal Nasser',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Faisal',
    status: DriverStatus.Idle,
    activeTask: null,
  },
  {
    id: 'drv-4',
    fullName: 'Hassan Kareem',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Hassan',
    status: DriverStatus.OnTask,
    activeTask: 'ORD-2824',
    taskCount: 1,
  },
  {
    id: 'drv-5',
    fullName: 'Omar Saeed',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Omar',
    status: DriverStatus.Idle,
    activeTask: null,
  },
  {
    id: 'drv-6',
    fullName: 'Tariq Mansour',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Tariq',
    status: DriverStatus.OnTask,
    activeTask: 'ORD-2815',
    taskCount: 1,
  },
  {
    id: 'drv-7',
    fullName: 'Nour El-Din',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nour',
    status: DriverStatus.Idle,
    activeTask: null,
  },
]
