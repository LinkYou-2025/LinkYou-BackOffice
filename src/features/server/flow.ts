import type { ServerAction, ServerStatus } from '@/api/types'

/** EC2 상태 기준의 큰 단계. 앱 헬스·모니터링은 진행 단계(steps)에서 따로 본다. */
export type Phase = 'ON' | 'OFF' | 'STARTING' | 'STOPPING' | 'UNKNOWN'

export function derivePhase(status: ServerStatus): Phase {
  switch (status.ec2) {
    case 'running':
      return 'ON'
    case 'stopped':
      return 'OFF'
    case 'pending':
      return 'STARTING'
    case 'stopping':
      return 'STOPPING'
    default:
      return 'UNKNOWN'
  }
}

export type StepState = 'done' | 'active' | 'pending'

export interface Step {
  key: string
  label: string
  state: StepState
}

interface StepDef {
  key: string
  label: string
  done: boolean
}

/** 앞 단계가 끝나야 다음 단계가 진행되므로, 처음 끝나지 않은 단계만 active 로 둔다. */
function toSteps(defs: StepDef[]): Step[] {
  let activeAssigned = false
  return defs.map(({ key, label, done }) => {
    if (done) return { key, label, state: 'done' }
    if (!activeAssigned) {
      activeAssigned = true
      return { key, label, state: 'active' }
    }
    return { key, label, state: 'pending' }
  })
}

/**
 * 서버 켜기: EC2 시작 → 앱 헬스 확인 → 모니터링 켜기 → 완료
 * 서버 끄기: 모니터링 끄기 → EC2 중지 → 완료
 * (끌 때는 알람이 울리지 않도록 모니터링을 먼저 끄고, 켤 때는 앱이 뜬 뒤에 모니터링을 켠다)
 */
export function buildSteps(action: ServerAction, status: ServerStatus): Step[] {
  if (action === 'START') {
    const ec2Up = status.ec2 === 'running'
    const appUp = ec2Up && status.app === 'up'
    const monitoringOn = appUp && status.monitoring === 'active'
    return toSteps([
      { key: 'ec2', label: 'EC2 시작', done: ec2Up },
      { key: 'health', label: '앱 헬스 확인', done: appUp },
      { key: 'monitoring', label: '모니터링 켜기', done: monitoringOn },
      { key: 'done', label: '완료', done: monitoringOn },
    ])
  }

  const monitoringOff = status.monitoring === 'muted'
  const ec2Down = monitoringOff && status.ec2 === 'stopped'
  return toSteps([
    { key: 'monitoring', label: '모니터링 끄기', done: monitoringOff },
    { key: 'ec2', label: 'EC2 중지', done: ec2Down },
    { key: 'done', label: '완료', done: ec2Down },
  ])
}

export function isFlowComplete(steps: Step[]) {
  return steps.every((step) => step.state === 'done')
}
