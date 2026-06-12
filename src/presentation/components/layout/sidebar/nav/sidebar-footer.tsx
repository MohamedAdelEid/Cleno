import { useTranslation } from '@/presentation/hooks/use-translation'
import { useIsSidebarRouteActive } from '@/presentation/hooks/use-active-nav-href'
import type { NavigationGroup } from '@/presentation/navigation'
import { cn } from '@/presentation/utils'
import { SidebarNavItem } from './sidebar-nav-item'
import { SidebarNavParent } from './sidebar-nav-parent'
import { SidebarUserMenu } from '../sidebar-user-menu'

interface SidebarFooterProps {
  groups: NavigationGroup[]
  isCollapsed: boolean
  startIndex: number
  onNavigate?: () => void
}

export const SidebarFooter = ({
  groups,
  isCollapsed,
  startIndex,
  onNavigate,
}: SidebarFooterProps) => {
  const { t } = useTranslation('navigation')

  let itemIndex = startIndex

  return (
    <div
      className={cn(
        'z-10 shrink-0 space-y-2 border-t border-sidebar-border bg-sidebar pt-3',
        isCollapsed ? 'pb-3' : 'pb-4',
      )}
    >
      {groups.map((group) =>
        group.items.map((item) => {
          const element = item.children?.length ? (
            <SidebarNavParent
              key={item.titleKey}
              item={item}
              label={t(item.titleKey)}
              index={itemIndex}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ) : (
            <SidebarNavLeafItem
              key={item.href ?? item.titleKey}
              item={item}
              label={t(item.titleKey)}
              index={itemIndex}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          )

          itemIndex += 1
          return element
        }),
      )}

      <SidebarUserMenu isCollapsed={isCollapsed} />
    </div>
  )
}

interface SidebarNavLeafItemProps {
  item: NavigationGroup['items'][number]
  label: string
  index: number
  isCollapsed: boolean
  onNavigate?: () => void
}

const SidebarNavLeafItem = ({
  item,
  label,
  index,
  isCollapsed,
  onNavigate,
}: SidebarNavLeafItemProps) => {
  const isActive = useIsSidebarRouteActive(item.href)

  return (
    <SidebarNavItem
      item={item}
      label={label}
      index={index}
      isCollapsed={isCollapsed}
      isActive={isActive}
      onNavigate={onNavigate}
    />
  )
}
