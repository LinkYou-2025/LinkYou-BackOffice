import { Activity, Clock, HeartPulse, Server } from 'lucide-react'
import type { ServerStatus } from '@/api/types'
import { formatTime } from '@/lib/format'
import { StatusCard } from './StatusCard'
import { APP_LABELS, APP_OFFLINE, EC2_LABELS, MONITORING_LABELS, UNAVAILABLE, type LabelInfo } from './labels'
import { STATUS_POLL_MS } from './hooks'

interface StatusCardsProps {
  status?: ServerStatus
  isLoading: boolean
}

export function StatusCards({ status, isLoading }: StatusCardsProps) {
  // 데이터가 아직 없을 때: 로딩 중이면 스켈레톤(undefined), 실패했으면 "확인 불가"
  const resolve = (info: LabelInfo | undefined): LabelInfo | undefined =>
    info ?? (isLoading ? undefined : UNAVAILABLE)

  const ec2 = resolve(status && EC2_LABELS[status.ec2])
  const app = resolve(status && (status.ec2 === 'running' ? APP_LABELS[status.app] : APP_OFFLINE))
  const monitoring = resolve(status && MONITORING_LABELS[status.monitoring])

  return (
    <section aria-label="서버 상태" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatusCard icon={Server} title="EC2" info={ec2} />
      <StatusCard icon={HeartPulse} title="앱 헬스" info={app} />
      <StatusCard icon={Activity} title="모니터링" info={monitoring} />
      <StatusCard
        icon={Clock}
        title="마지막 갱신"
        info={
          status
            ? { label: formatTime(status.updatedAt), tone: 'info', code: `${STATUS_POLL_MS / 1000}s` }
            : resolve(undefined)
        }
      />
    </section>
  )
}
