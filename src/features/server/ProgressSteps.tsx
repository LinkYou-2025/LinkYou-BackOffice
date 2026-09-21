import { Check } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import type { Step, StepState } from './flow'

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
        <Check size={12} strokeWidth={3} aria-hidden="true" />
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span className="flex size-5 items-center justify-center rounded-full border border-primary text-primary">
        <Spinner className="size-3" />
      </span>
    )
  }
  return <span className="size-5 rounded-full border border-border" />
}

const STATE_TEXT: Record<StepState, string> = {
  done: '완료',
  active: '진행 중',
  pending: '대기',
}

export function ProgressSteps({ steps }: { steps: Step[] }) {
  return (
    <ol aria-label="진행 단계" className="flex items-center">
      {steps.map((step, index) => (
        <li
          key={step.key}
          aria-current={step.state === 'active' ? 'step' : undefined}
          className={cn('flex items-center gap-3', index < steps.length - 1 && 'flex-1')}
        >
          <span className="flex items-center gap-2 text-sm whitespace-nowrap">
            <StepIcon state={step.state} />
            <span
              className={cn(
                step.state === 'active' && 'font-medium text-white',
                step.state === 'done' && 'text-muted',
                step.state === 'pending' && 'text-subtle',
              )}
            >
              {step.label}
              <span className="sr-only"> ({STATE_TEXT[step.state]})</span>
            </span>
          </span>
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={cn('h-px flex-1', step.state === 'done' ? 'bg-primary' : 'bg-border')}
            />
          )}
        </li>
      ))}
    </ol>
  )
}
