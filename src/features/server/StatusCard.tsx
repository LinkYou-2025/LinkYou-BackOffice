import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { LabelInfo } from './labels'

interface StatusCardProps {
  icon: LucideIcon
  title: string
  /** undefined 이면 로딩 스켈레톤을 보여준다 */
  info?: LabelInfo
}

export function StatusCard({ icon: Icon, title, info }: StatusCardProps) {
  return (
    <Card className="flex min-h-[100px] flex-col justify-between gap-3 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Icon size={12} aria-hidden="true" />
        <h2 className="font-normal">{title}</h2>
      </div>
      {info ? (
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          <p className="text-[28px] leading-none font-medium whitespace-nowrap">{info.label}</p>
          <Badge tone={info.tone}>{info.code}</Badge>
        </div>
      ) : (
        <div aria-hidden="true" className="h-7 w-28 animate-pulse rounded bg-white/10" />
      )}
    </Card>
  )
}
