import { useEffect, useState, type ReactNode } from 'react'
import { Power } from 'lucide-react'
import type { ServerAction, ServerStatus } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { buildSteps, derivePhase, isFlowComplete } from './flow'
import { STATUS_POLL_MS, useServerAction } from './hooks'
import { ProgressSteps } from './ProgressSteps'

/** 요청 후 이 시간 안에 끝나지 않으면 "처리 중" 표시를 풀고 직접 확인하도록 안내한다. */
const FLOW_TIMEOUT_MS = 3 * 60_000

const ACTION_COPY: Record<
  ServerAction,
  { title: string; description: string; confirm: string; tone: 'primary' | 'danger' }
> = {
  START: {
    title: 'dev 서버를 켤까요?',
    description: 'EC2를 시작하고, 앱이 정상 응답하면 모니터링 알람을 다시 켭니다. 보통 1~2분 걸려요.',
    confirm: '서버 켜기',
    tone: 'primary',
  },
  STOP: {
    title: 'dev 서버를 끄시겠어요?',
    description: '모니터링 알람을 먼저 끈 뒤 EC2를 중지합니다. 진행 중인 개발·테스트가 중단될 수 있어요.',
    confirm: '서버 끄기',
    tone: 'danger',
  },
}

interface ServerControlPanelProps {
  status?: ServerStatus
  isLoading: boolean
  isError: boolean
}

export function ServerControlPanel({ status, isLoading, isError }: ServerControlPanelProps) {
  const toast = useToast()
  const action = useServerAction()
  const [confirming, setConfirming] = useState<ServerAction | null>(null)
  // 이 화면에서 요청한 동작. 상태가 목표에 도달할 때까지 진행 단계를 보여준다.
  const [submitted, setSubmitted] = useState<ServerAction | null>(null)

  const phase = status ? derivePhase(status) : 'UNKNOWN'
  const inFlight: ServerAction | null = phase === 'STARTING' ? 'START' : phase === 'STOPPING' ? 'STOP' : null
  const flowAction = submitted ?? inFlight
  const steps = status && flowAction ? buildSteps(flowAction, status) : null
  const complete = steps ? isFlowComplete(steps) : false
  const busy = steps ? !complete : false

  useEffect(() => {
    if (submitted && complete) {
      toast.success(submitted === 'START' ? 'dev 서버가 켜졌어요.' : 'dev 서버가 꺼졌어요.')
      setSubmitted(null)
    }
  }, [submitted, complete, toast])

  useEffect(() => {
    if (!submitted) return
    const timer = setTimeout(() => {
      setSubmitted(null)
      toast.error('처리가 오래 걸리고 있어요. 상태를 직접 확인해 주세요.')
    }, FLOW_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [submitted, toast])

  function handleConfirm() {
    if (!confirming) return
    const target = confirming
    action.mutate(target, {
      onSuccess: () => {
        setSubmitted(target)
        toast.info(target === 'START' ? '서버 켜기를 요청했어요.' : '서버 끄기를 요청했어요.')
      },
      onError: (error) => toast.error(error.message),
      onSettled: () => setConfirming(null),
    })
  }

  let control: ReactNode
  if (busy) {
    control = (
      <Button size="lg" loading disabled>
        {flowAction === 'START' ? '켜는 중…' : '끄는 중…'}
      </Button>
    )
  } else if (phase === 'OFF') {
    control = (
      <Button size="lg" leftIcon={<Power size={16} aria-hidden="true" />} onClick={() => setConfirming('START')}>
        서버 켜기
      </Button>
    )
  } else if (phase === 'ON') {
    control = (
      <Button
        size="lg"
        variant="danger"
        leftIcon={<Power size={16} aria-hidden="true" />}
        onClick={() => setConfirming('STOP')}
      >
        서버 끄기
      </Button>
    )
  } else {
    control = (
      <Button size="lg" disabled>
        {isLoading ? '상태 확인 중…' : '상태를 확인할 수 없어요'}
      </Button>
    )
  }

  let description: string
  if (busy) {
    description =
      flowAction === 'START' ? '서버를 켜는 중이에요. 보통 1~2분 걸려요.' : '서버를 끄는 중이에요.'
  } else if (phase === 'ON') {
    description = 'dev 서버가 켜져 있어요.'
  } else if (phase === 'OFF') {
    description = 'dev 서버가 꺼져 있어요.'
  } else {
    description = isLoading ? '상태를 확인하는 중이에요.' : '상태를 불러오지 못했어요. 잠시 후 다시 시도해요.'
  }

  const dotClass = busy
    ? 'bg-warning animate-pulse'
    : phase === 'ON'
      ? 'bg-success'
      : phase === 'OFF'
        ? 'bg-subtle'
        : 'bg-danger'

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className={cn('size-2.5 rounded-full', dotClass)} />
            <h2 className="text-lg font-medium">dev 서버</h2>
          </div>
          <p className="mt-1 text-sm text-muted" role="status">
            {description}
          </p>
        </div>
        {control}
      </div>

      {steps && busy && (
        <div className="mt-6 border-t border-border/60 pt-6">
          <ProgressSteps steps={steps} />
        </div>
      )}

      <p className="mt-6 text-xs text-subtle">
        {STATUS_POLL_MS / 1000}초마다 자동으로 갱신돼요.
        {isError && status && ' 최근 갱신에 실패해서 마지막으로 받은 상태를 보여주고 있어요.'}
      </p>

      <ConfirmDialog
        open={confirming !== null}
        title={confirming ? ACTION_COPY[confirming].title : ''}
        description={confirming ? ACTION_COPY[confirming].description : ''}
        confirmLabel={confirming ? ACTION_COPY[confirming].confirm : ''}
        tone={confirming ? ACTION_COPY[confirming].tone : 'primary'}
        loading={action.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(null)}
      />
    </Card>
  )
}
