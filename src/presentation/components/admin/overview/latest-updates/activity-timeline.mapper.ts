import type { DashboardActivityFeedItem } from '@/domain/types'
import type { ActivityItem } from './latest-updates.types'
import { getDashboardActivityVisual } from './dashboard-activity.config'

export const toActivityTimelineItem = (item: DashboardActivityFeedItem): ActivityItem => {
  const visual = getDashboardActivityVisual(item.type)

  return {
    id: item.id,
    icon: visual.icon,
    iconClassName: visual.iconClassName,
    title: item.title,
    description: item.description,
    time: item.timeLabel,
    occurredAt: new Date(item.occurredAt),
  }
}
