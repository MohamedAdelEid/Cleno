export const MAX_FEATURED_ROLES = 3

export type FeaturedBulkAction = 'set' | 'remove'

export interface FeaturedBulkState {
  action: FeaturedBulkAction | null
  disabled: boolean
  nextFeaturedIds: string[]
}

export const getFeaturedBulkState = (
  selectedIds: string[],
  featuredRoleIds: string[],
): FeaturedBulkState => {
  const selectedCount = selectedIds.length

  if (selectedCount === 0 || selectedCount > MAX_FEATURED_ROLES) {
    return { action: null, disabled: true, nextFeaturedIds: featuredRoleIds }
  }

  const featuredSet = new Set(featuredRoleIds)
  const allSelectedAreFeatured = selectedIds.every((id) => featuredSet.has(id))

  if (allSelectedAreFeatured) {
    return {
      action: 'remove',
      disabled: false,
      nextFeaturedIds: featuredRoleIds.filter((id) => !selectedIds.includes(id)),
    }
  }

  const featuredSlotsFull = featuredRoleIds.length >= MAX_FEATURED_ROLES
  const selectedNonFeatured = selectedIds.filter((id) => !featuredSet.has(id))
  const nextFeaturedIds = [...featuredRoleIds, ...selectedNonFeatured].slice(0, MAX_FEATURED_ROLES)
  const wouldExceed = featuredRoleIds.length + selectedNonFeatured.length > MAX_FEATURED_ROLES

  return {
    action: 'set',
    disabled: featuredSlotsFull || wouldExceed,
    nextFeaturedIds,
  }
}
