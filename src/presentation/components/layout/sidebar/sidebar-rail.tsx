import { cn } from '@/presentation/utils'

interface SidebarRailProps {
  isCollapsed: boolean
  isRtl: boolean
  onToggle: () => void
}

export const SidebarRail = ({ isCollapsed, isRtl, onToggle }: SidebarRailProps) => {
  const cursorClass = !isRtl
    ? isCollapsed
      ? 'cursor-e-resize'
      : 'cursor-w-resize'
    : isCollapsed
      ? 'cursor-w-resize'
      : 'cursor-e-resize'

  return (
    <button
      type="button"
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      title="Toggle Sidebar"
      onClick={onToggle}
      className={cn(
        'absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear sm:flex',
        isRtl ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2',
        'after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2',
        'after:bg-sidebar-border hover:after:bg-foreground/25',
        cursorClass,
      )}
    />
  )
}
