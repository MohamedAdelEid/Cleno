import { motion } from 'framer-motion'

import { LaundryWorkflowStage } from '@/domain/enums'
import { cn } from '@/presentation/utils'

interface WorkflowTab {
  stage: LaundryWorkflowStage
  label: string
  count: number
}

interface WorkflowTabsProps {
  activeStage: LaundryWorkflowStage
  onStageChange: (stage: LaundryWorkflowStage) => void
  tabs: WorkflowTab[]
}

export const WorkflowTabs = ({ activeStage, onStageChange, tabs }: WorkflowTabsProps) => (
  <div className="relative flex items-center gap-1 rounded-xl border border-border/70 bg-muted/30 p-1">
    {tabs.map((tab) => {
      const isActive = tab.stage === activeStage

      return (
        <button
          key={tab.stage}
          type="button"
          onClick={() => onStageChange(tab.stage)}
          className={cn(
            'relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80',
          )}
        >
          {isActive && (
            <motion.span
              layoutId="workflow-tab-indicator"
              className="absolute inset-0 rounded-lg bg-background shadow-sm"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
          <span
            className={cn(
              'relative z-10 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold',
              isActive
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {tab.count}
          </span>
        </button>
      )
    })}
  </div>
)
