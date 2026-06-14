import { forwardRef, useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LottieModule, { type LottieComponentProps, type LottieRefCurrentProps } from 'lottie-react'
import { CircleX, Eye, EyeOff } from 'lucide-react'

import visibilityAnimation from '@/presentation/assets/icons/animations/visibility.json'
import { cn } from '@/presentation/utils'
import { useFieldContext } from '../field'
import type { InputProps } from './types'

const Lottie =
  typeof LottieModule === 'function'
    ? LottieModule
    : (LottieModule as { default: ComponentType<LottieComponentProps> }).default

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      value,
      defaultValue,
      onChange,
      onClear,
      disabled,
      icon: Icon,
      iconPosition = 'end',
      isPasswordField = false,
      ...props
    },
    ref,
  ) => {
    const { invalid, disabled: fieldDisabled, success } = useFieldContext()
    const isDisabled = disabled ?? fieldDisabled
    const isControlled = value !== undefined

    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const [showPassword, setShowPassword] = useState(false)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const [isClearing, setIsClearing] = useState(false)
    const internalRef = useRef<HTMLInputElement>(null)
    const lottieRef = useRef<LottieRefCurrentProps>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement | null>) ?? internalRef

    const currentValue = isControlled ? value : internalValue
    const hasValue = String(currentValue ?? '').length > 0

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setInternalValue(event.target.value)
        onChange?.(event)
      },
      [isControlled, onChange],
    )

    const handleClear = useCallback(() => {
      setIsClearing(true)
      window.setTimeout(() => {
        if (!isControlled) setInternalValue('')
        onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
        onClear?.()
        setIsClearing(false)
        inputRef.current?.focus()
      }, 150)
    }, [isControlled, onChange, onClear, inputRef])

    const togglePasswordVisibility = useCallback(() => {
      if (isFirstRender) setIsFirstRender(false)
      setShowPassword((current) => !current)
    }, [isFirstRender])

    useEffect(() => {
      if (!Lottie || isFirstRender || !lottieRef.current) return

      if (showPassword) {
        lottieRef.current.setDirection(1)
        lottieRef.current.play()
      } else {
        lottieRef.current.setDirection(-1)
        lottieRef.current.play()
      }
    }, [showPassword, isFirstRender])

    const showClear = hasValue && !isDisabled && !isPasswordField
    const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type

    const getPadding = () => {
      if (isPasswordField && Icon) return 'ps-10 pe-10'
      if (isPasswordField) return 'ps-3 pe-10'
      if (Icon && showClear) return 'px-10'
      if (Icon && iconPosition === 'start') return 'ps-10 pe-3'
      if (Icon && iconPosition === 'end') return 'ps-3 pe-10'
      if (showClear) return 'ps-3 pe-10'
      return 'px-3'
    }

    return (
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type={inputType}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          disabled={isDisabled}
          aria-invalid={invalid || undefined}
          style={{
            color: isClearing ? 'transparent' : undefined,
            transition: 'color 0.15s ease-out',
          }}
          className={cn(
            'w-full rounded-[10px] border border-border py-3 text-sm transition-[border-color,box-shadow] duration-200 outline-none',
            'placeholder:text-muted-foreground caret-primary',
            'focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]',
            hasValue && !invalid && !success && !isDisabled && 'text-foreground',
            isDisabled && 'cursor-not-allowed border-border/80 bg-muted/40 text-muted-foreground',
            getPadding(),
            className,
            invalid &&
            'border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]',
            success &&
            !invalid &&
            'border-emerald-500 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]',
          )}
          {...props}
        />

        {Icon ? (
          <span
            className={cn(
              'pointer-events-none absolute flex items-center text-muted-foreground',
              iconPosition === 'start' || isPasswordField ? 'inset-s-3' : 'inset-e-3',
            )}
          >
            <Icon className="size-5" />
          </span>
        ) : null}

        <AnimatePresence>
          {showClear ? (
            <motion.button
              type="button"
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-e-3 flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <CircleX className="size-5" />
            </motion.button>
          ) : null}
        </AnimatePresence>

        {isPasswordField && !isDisabled ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-e-3 flex cursor-pointer items-center text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
          >
            {Lottie ? (
              <span className="inline-flex size-6 items-center justify-center dark:invert dark:opacity-90">
                <Lottie
                  lottieRef={lottieRef}
                  animationData={visibilityAnimation}
                  loop={false}
                  autoplay={false}
                  className="size-6"
                />
              </span>
            ) : showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
