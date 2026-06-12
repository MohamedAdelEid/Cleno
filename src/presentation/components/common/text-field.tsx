import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/presentation/utils/cn'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id ?? props.name

    return (
      <div>
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
        <div className="relative">
          {icon ? (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
          ) : null}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-transparent py-2.5 pr-3 text-sm text-gray-900 outline-none transition-colors dark:text-white',
              icon ? 'pl-10' : 'pl-3',
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-300 focus:border-brand-500 dark:border-gray-700',
              className,
            )}
            {...props}
          />
        </div>
        {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      </div>
    )
  },
)

TextField.displayName = 'TextField'
