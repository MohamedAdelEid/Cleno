import { Check, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Popover, PopoverContent, PopoverTrigger } from '@/presentation/components/ui/popover'
import { SearchInput } from '@/presentation/components/ui/search-input'
import { cn } from '@/presentation/utils'

export interface SearchableSelectOption {
  value: string
  label: string
}

export interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  customValueLabel?: (value: string) => string
  allowCustom?: boolean
  disabled?: boolean
  invalid?: boolean
  className?: string
}

const triggerClassName = (invalid?: boolean, disabled?: boolean, hasValue?: boolean) =>
  cn(
    'flex min-h-[48px] w-full items-center justify-between gap-2 rounded-[10px] border border-border bg-background px-3 py-3 text-sm transition-[border-color,box-shadow] duration-200 outline-none',
    'focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]',
    !hasValue && 'text-muted-foreground',
    invalid &&
    'border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]',
    disabled && 'cursor-not-allowed border-border/80 bg-muted/40 text-muted-foreground',
  )

export const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found.',
  customValueLabel = (nextValue) => `Use "${nextValue}"`,
  allowCustom = true,
  disabled,
  invalid,
  className,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalized) ||
        option.value.toLowerCase().includes(normalized),
    )
  }, [options, query])

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? (value || placeholder)

  const handleSelect = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
    setQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(triggerClassName(invalid, disabled, !!value), className)}
        >
          <span className="truncate text-start">{selectedLabel}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder={searchPlaceholder}
          autoFocus
        />

        <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-border/60">
          {filteredOptions.length === 0 && !allowCustom ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            <ul className="p-1">
              {filteredOptions.map((option) => {
                const isSelected = value === option.value

                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm transition-colors',
                        isSelected
                          ? 'bg-muted text-foreground'
                          : 'text-foreground hover:bg-muted/60',
                      )}
                    >
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected ? <Check className="size-4 shrink-0 opacity-70" /> : null}
                    </button>
                  </li>
                )
              })}

              {allowCustom &&
                query.trim() &&
                !filteredOptions.some((option) => option.value === query.trim()) ? (
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelect(query.trim())}
                    className="flex w-full items-center rounded-md px-2.5 py-2 text-start text-sm text-foreground hover:bg-muted/60"
                  >
                    {customValueLabel(query.trim())}
                  </button>
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
