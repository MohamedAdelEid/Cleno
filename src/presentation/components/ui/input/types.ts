import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'type'> {
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconPosition?: 'start' | 'end'
  isPasswordField?: boolean
  onClear?: () => void
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  autoResize?: boolean
}
