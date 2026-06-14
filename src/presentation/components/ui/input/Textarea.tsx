import { forwardRef, useCallback, useLayoutEffect, useRef } from 'react'

import { cn } from '@/presentation/utils'
import { useFieldContext } from '../field'
import type { TextareaProps } from './types'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, invalid: invalidProp, disabled, autoResize = false, onChange, rows = 1, ...props },
    ref,
  ) => {
    const { invalid: fieldInvalid, disabled: fieldDisabled, success } = useFieldContext()
    const invalid = invalidProp ?? fieldInvalid
    const isDisabled = disabled ?? fieldDisabled
    const innerRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement | null>) ?? innerRef

    const resize = useCallback(() => {
      const element = textareaRef.current
      if (!element || !autoResize) return

      element.style.height = '0px'
      element.style.height = `${element.scrollHeight}px`
    }, [autoResize, textareaRef])

    useLayoutEffect(() => {
      resize()
    }, [resize, props.value, props.defaultValue])

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event)
      if (autoResize) resize()
    }

    return (
      <textarea
        ref={textareaRef}
        disabled={isDisabled}
        rows={rows}
        aria-invalid={invalid || undefined}
        onChange={handleChange}
        className={cn(
          'w-full overflow-hidden rounded-[10px] border border-border bg-transparent px-3 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow,height] duration-200',
          'placeholder:text-muted-foreground caret-primary',
          'focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]',
          isDisabled && 'cursor-not-allowed border-border/80 bg-muted/40 text-muted-foreground',
          invalid &&
          'border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]',
          success &&
          !invalid &&
          'border-emerald-500 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]',
          // autoResize ? 'min-h-[52px]' : 'min-h-[120px] resize-y',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
