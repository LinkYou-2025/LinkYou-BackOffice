import { describe, expect, it } from 'vitest'
import type { ServerStatus } from '@/api/types'
import { buildSteps, derivePhase, isFlowComplete, type Step } from './flow'

function status(overrides: Partial<ServerStatus>): ServerStatus {
  return {
    ec2: 'running',
    app: 'up',
    monitoring: 'active',
    updatedAt: '2026-09-21T00:00:00.000Z',
    ...overrides,
  }
}

function states(steps: Step[]) {
  return steps.map((step) => `${step.key}:${step.state}`)
}

describe('derivePhase', () => {
  it.each([
    ['running', 'ON'],
    ['stopped', 'OFF'],
    ['pending', 'STARTING'],
    ['stopping', 'STOPPING'],
    ['unknown', 'UNKNOWN'],
  ] as const)('EC2 %s 이면 %s', (ec2, expected) => {
    expect(derivePhase(status({ ec2 }))).toBe(expected)
  })
})

describe('buildSteps - 서버 켜기', () => {
  it('EC2 가 아직 꺼져 있으면 첫 단계만 진행 중이다', () => {
    const steps = buildSteps('START', status({ ec2: 'stopped', app: 'unknown', monitoring: 'muted' }))
    expect(states(steps)).toEqual(['ec2:active', 'health:pending', 'monitoring:pending', 'done:pending'])
  })

  it('EC2 가 떴지만 앱이 아직 응답하지 않으면 헬스 확인 단계가 진행 중이다', () => {
    const steps = buildSteps('START', status({ ec2: 'running', app: 'unknown', monitoring: 'muted' }))
    expect(states(steps)).toEqual(['ec2:done', 'health:active', 'monitoring:pending', 'done:pending'])
  })

  it('앱이 정상이어도 모니터링이 무음이면 모니터링 켜기 단계가 진행 중이다', () => {
    const steps = buildSteps('START', status({ ec2: 'running', app: 'up', monitoring: 'muted' }))
    expect(states(steps)).toEqual(['ec2:done', 'health:done', 'monitoring:active', 'done:pending'])
    expect(isFlowComplete(steps)).toBe(false)
  })

  it('EC2·앱·모니터링이 모두 정상이면 완료다', () => {
    const steps = buildSteps('START', status({}))
    expect(states(steps)).toEqual(['ec2:done', 'health:done', 'monitoring:done', 'done:done'])
    expect(isFlowComplete(steps)).toBe(true)
  })

  it('EC2 가 꺼진 상태에서 모니터링만 active 여도 앞 단계가 끝나기 전에는 완료가 아니다', () => {
    const steps = buildSteps('START', status({ ec2: 'stopped', app: 'unknown', monitoring: 'active' }))
    expect(isFlowComplete(steps)).toBe(false)
  })
})

describe('buildSteps - 서버 끄기', () => {
  it('요청 직후에는 모니터링 끄기가 먼저 진행 중이다', () => {
    const steps = buildSteps('STOP', status({}))
    expect(states(steps)).toEqual(['monitoring:active', 'ec2:pending', 'done:pending'])
  })

  it('모니터링이 꺼진 뒤 EC2 가 아직 실행/중지 중이면 EC2 중지 단계가 진행 중이다', () => {
    const steps = buildSteps('STOP', status({ ec2: 'stopping', monitoring: 'muted' }))
    expect(states(steps)).toEqual(['monitoring:done', 'ec2:active', 'done:pending'])
  })

  it('모니터링이 무음이고 EC2 가 stopped 이면 완료다', () => {
    const steps = buildSteps('STOP', status({ ec2: 'stopped', app: 'unknown', monitoring: 'muted' }))
    expect(states(steps)).toEqual(['monitoring:done', 'ec2:done', 'done:done'])
    expect(isFlowComplete(steps)).toBe(true)
  })

  it('EC2 만 stopped 이고 모니터링이 켜져 있으면 (알람이 울릴 수 있으므로) 완료로 보지 않는다', () => {
    const steps = buildSteps('STOP', status({ ec2: 'stopped', app: 'unknown', monitoring: 'active' }))
    expect(isFlowComplete(steps)).toBe(false)
  })
})
