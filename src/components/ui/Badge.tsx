import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const tones: Record<Tone, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-accent/10 text-accent',
  neutral: 'bg-white/5 text-muted',
}

interface BadgeProps {
  tone?: Tone
  dot?: boolean
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', dot = true, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
