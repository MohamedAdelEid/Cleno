import type { ReactNode } from 'react'
import { SidebarToggleIcon } from '@/presentation/assets/icons/SidebarToggle'
import { DashboardBreadcrumb } from './dashboard-breadcrumb'
import { LanguageToggle } from './language-toggle'
import { ThemeToggle } from './theme-toggle'
import { cn, smoothScrollClass } from '@/presentation/utils'

interface DashboardContentProps {
  children: ReactNode
  isMobile: boolean
  isMobileOpen: boolean
  onMobileMenuToggle: () => void
}

export const DashboardContent = ({
  children,
  isMobile,
  isMobileOpen,
  onMobileMenuToggle,
}: DashboardContentProps) => (
  <div
    className={cn(
      'flex h-dvh max-h-dvh min-w-0 flex-1 flex-col overflow-hidden',
      isMobile && isMobileOpen && 'overflow-hidden',
    )}
  >
    <header className="z-20 flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-dashed border-sidebar-border bg-background/95 px-4 backdrop-blur-sm md:hidden">
      <button
        type="button"
        onClick={onMobileMenuToggle}
        aria-label="Open sidebar"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
      >
        <SidebarToggleIcon className="size-5" />
      </button>
      <DashboardBreadcrumb className="min-w-0 flex-1" />
      <div className="ms-auto flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>

    <header className="z-20 mx-3 hidden h-[4.5rem] shrink-0 items-center gap-3 border-b border-dashed border-sidebar-border bg-background/95 px-4 backdrop-blur-sm md:flex">
      <DashboardBreadcrumb />
      <div className="ms-auto flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>

    <main className={cn('min-h-0 flex-1 p-4 md:p-6', smoothScrollClass)}>{children}</main>
  </div>
)
