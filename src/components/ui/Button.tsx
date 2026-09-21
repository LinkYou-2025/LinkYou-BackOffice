import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-gradient text-white hover:brightness-110',
  secondary: 'border border-border bg-surface text-white hover:bg-surface-alt',
  danger: 'bg-danger text-white hover:brightness-110',
  ghost: 'text-muted hover:bg-surface hover:text-white',
}

const sizes: Record<Size, string> = {
  sm: 'h-[30px] px-3 text-xs',
  md: 'h-[42px] px-4 text-sm',
  lg: 'h-[46px] px-4 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-medium whitespace-nowrap transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
    </button>
  )
}
