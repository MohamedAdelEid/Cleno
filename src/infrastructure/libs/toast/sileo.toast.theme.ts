import type { SileoOptions } from 'sileo'

/** Theme-aware defaults per https://sileo.aaryan.design/docs/styling */
export const getSileoToasterOptions = (mode: 'light' | 'dark'): Partial<SileoOptions> => {
  if (mode === 'dark') {
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

  return {
    fill: 'hsl(0 0% 100%)',
    roundness: 16,
    styles: {
      title: 'text-sm! font-semibold! text-foreground! text-center!',
      description: 'text-sm! text-muted-foreground! text-center!',
      badge: 'bg-foreground/5!',
      button: 'bg-foreground/5! hover:bg-foreground/10!',
    },
  }
}
