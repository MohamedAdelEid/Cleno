import { useTranslation } from '@/presentation/hooks/use-translation'
import { useIsSidebarRouteActive } from '@/presentation/hooks/use-active-nav-href'
import type { NavigationGroup } from '@/presentation/navigation'
import { cn } from '@/presentation/utils'
import { SIDEBAR_DURATION, SIDEBAR_EASE } from '../animations'
import { SidebarNavItem } from './sidebar-nav-item'
import { SidebarNavParent } from './sidebar-nav-parent'

interface SidebarNavGroupProps {
  group: NavigationGroup
  startIndex: number
  isCollapsed: boolean
  onNavigate?: () => void
}

export const SidebarNavGroup = ({
  group,
  startIndex,
  isCollapsed,
  onNavigate,
}: SidebarNavGroupProps) => {
  const { t } = useTranslation('navigation')

  return (
    <div className="space-y-1.5">
      {group.titleKey && (
        <div
          className={cn(
            'overflow-hidden transition-[height,margin-bottom]',
            isCollapsed ? 'mb-0 h-0' : 'mb-2 h-5',
          )}
          style={{
            transitionDuration: `${SIDEBAR_DURATION}s`,
            transitionTimingFunction: `cubic-bezier(${SIDEBAR_EASE.join(',')})`,
          }}
        >
          <p
            className={cn(
              'px-3 text-sm font-medium tracking-wide text-sidebar-foreground/60 uppercase',
              'transition-opacity duration-200',
              isCollapsed ? 'opacity-0' : 'opacity-100',
            )}
          >
            {t(group.titleKey)}
          </p>
        </div>
      )}

      {group.items.map((item, index) => {
        const itemIndex = startIndex + index

        if (item.children?.length) {
          return (
            <SidebarNavParent
              key={item.titleKey}
              item={item}
              label={t(item.titleKey)}
              index={itemIndex}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          )
        }

        return (
          <SidebarNavLeafItem
            key={item.href ?? item.titleKey}
            item={item}
            label={t(item.titleKey)}
            index={itemIndex}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )
      })}
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
