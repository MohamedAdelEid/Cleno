import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { exceedsWordLimit, truncateWords } from '@/presentation/utils'

const MAX_WORDS = 12

interface RoleDescriptionCellProps {
  description: string
}

export const RoleDescriptionCell = ({ description }: RoleDescriptionCellProps) => {
  const truncated = truncateWords(description, MAX_WORDS)
  const isTruncated = exceedsWordLimit(description, MAX_WORDS)

  if (!isTruncated) {
    return <span className="text-sm text-muted-foreground">{description}</span>
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default text-sm text-muted-foreground">{truncated}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-start">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
