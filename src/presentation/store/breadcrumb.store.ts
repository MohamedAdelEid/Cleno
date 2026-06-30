import { create } from 'zustand'

interface BreadcrumbStore {
  dynamicLabel: string | null
  setDynamicLabel: (label: string | null) => void
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  dynamicLabel: null,
  setDynamicLabel: (label) => set({ dynamicLabel: label }),
}))
