import { useCallback, useRef, forwardRef, type ComponentProps } from 'react'
import { SearchIcon, type SearchIconHandle } from '@/presentation/assets/icons/Search'
import { cn } from '@/presentation/utils'

const isMacPlatform = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)

interface SearchInputProps extends Omit<ComponentProps<'input'>, 'onChange'> {
  value?: string
  onValueChange?: (value: string) => void
  showShortcut?: boolean
  containerClassName?: string
  variant?: 'default' | 'sidebar'
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onValueChange,
      placeholder,
      showShortcut = false,
      containerClassName,
      variant = 'default',
      className,
      ...props
    },
    ref,
  ) => {
    const iconRef = useRef<SearchIconHandle>(null)
    const isMac = isMacPlatform()

    const handleMouseEnter = useCallback(() => {
      iconRef.current?.startAnimation()
    }, [])

    const handleMouseLeave = useCallback(() => {
      iconRef.current?.stopAnimation()
    }, [])

    return (
      <label
        className={cn('relative block', containerClassName)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SearchIcon
          ref={iconRef}
          size={18}
          className="pointer-events-none absolute top-1/2 start-3.5 z-10 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={ref}
          type="text"
          role="searchbox"
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-10 w-full rounded-xl border ps-10 text-sm outline-none transition-all duration-300 ease-out',
            'placeholder:text-muted-foreground/80',
            'focus-visible:ring-2 focus-visible:ring-ring/30',
            variant === 'sidebar'
              ? cn(
                  'border-sidebar-border/80 bg-white text-sidebar-foreground dark:bg-sidebar/10',
                  'hover:border-sidebar-border',
                  'focus-visible:border-sidebar-border',
                  showShortcut ? 'pe-[3.5rem]' : 'pe-3',
                )
              : cn(
                  'border-border/80 bg-background text-foreground',
                  'hover:border-border',
                  'focus-visible:border-border',
                  'pe-3',
                ),
            className,
          )}
          {...props}
        />
        {showShortcut && (
          <kbd
            className={cn(
              'pointer-events-none absolute top-1/2 end-2.5 z-10 -translate-y-1/2',
              'inline-flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-md',
              'border border-border/70 bg-muted/60 px-1.5',
              'font-sans text-[11px] font-medium tracking-tight text-muted-foreground',
            )}
          >
            {isMac ? (
              <>
                <span className="text-[13px] leading-none">⌘</span>
                <span>K</span>
              </>
            ) : (
              <>
                <span>Ctrl</span>
                <span>K</span>
              </>
            )}
          </kbd>
        )}
      </label>
    )
  },
)

SearchInput.displayName = 'SearchInput'
