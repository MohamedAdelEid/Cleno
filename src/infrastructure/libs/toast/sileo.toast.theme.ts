import type { SileoOptions } from 'sileo'

/** Inverted from app theme so toasts stay visible on the page background. */
export const getSileoToasterOptions = (mode: 'light' | 'dark'): Partial<SileoOptions> => {
  if (mode === 'dark') {
    return {
      fill: 'hsl(0 0% 100%)',
      roundness: 16,
      styles: {
        title: 'text-sm! font-semibold! text-neutral-900! text-center!',
        description: 'text-sm! text-neutral-600! text-center!',
        badge: 'bg-neutral-900/5!',
        button: 'bg-neutral-900/5! hover:bg-neutral-900/10!',
      },
    }
  }

  return {
    fill: 'hsl(0 0% 7%)',
    roundness: 16,
    styles: {
      title: 'text-sm! font-semibold! text-white! text-center!',
      description: 'text-sm! text-white/75! text-center!',
      badge: 'bg-white/10!',
      button: 'bg-white/10! hover:bg-white/15!',
    },
  }
}
