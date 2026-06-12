import { cn } from './cn'

export const smoothScrollClass = cn(
  'overflow-y-auto overscroll-y-contain scroll-smooth',
  '[scrollbar-width:thin] [scrollbar-color:hsl(0_0%_72%/0.85)_transparent]',
  '[&::-webkit-scrollbar]:w-1',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20',
  '[&::-webkit-scrollbar-thumb]:transition-colors duration-300',
  'hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/35',
)
