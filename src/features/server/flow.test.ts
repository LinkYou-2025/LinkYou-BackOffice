import { describe, expect, it } from 'vitest'
import type { ServerStatus } from '@/api/types'
import { buildSteps, derivePhase, isFlowComplete, type Step } from './flow'

function status(overrides: Partial<ServerStatus>): ServerStatus {
  return {
    ec2: 'running',
    app: 'up',
    checkedAt: '2026-09-21T00:00:00.000Z',
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
    const steps = buildSteps('START', status({ ec2: 'stopped', app: 'down' }))
    expect(states(steps)).toEqual(['ec2:active', 'health:pending', 'done:pending'])
  })

  it('EC2 가 떴지만 앱이 아직 응답하지 않으면 헬스 확인 단계가 진행 중이다', () => {
    const steps = buildSteps('START', status({ ec2: 'running', app: 'down' }))
    expect(states(steps)).toEqual(['ec2:done', 'health:active', 'done:pending'])
    expect(isFlowComplete(steps)).toBe(false)
  })

  it('EC2 와 앱이 모두 정상이면 완료다', () => {
    const steps = buildSteps('START', status({}))
    expect(states(steps)).toEqual(['ec2:done', 'health:done', 'done:done'])
    expect(isFlowComplete(steps)).toBe(true)
  })

  it('EC2 가 꺼진 상태에서 앱만 up 이어도 앞 단계가 끝나기 전에는 완료가 아니다', () => {
    const steps = buildSteps('START', status({ ec2: 'pending', app: 'up' }))
    expect(isFlowComplete(steps)).toBe(false)
  })
})

describe('buildSteps - 서버 끄기', () => {
  it('EC2 가 아직 실행/중지 중이면 EC2 중지 단계가 진행 중이다', () => {
    const steps = buildSteps('STOP', status({ ec2: 'stopping' }))
    expect(states(steps)).toEqual(['ec2:active', 'done:pending'])
  })

  it('EC2 가 stopped 이면 완료다', () => {
    const steps = buildSteps('STOP', status({ ec2: 'stopped', app: 'down' }))
    expect(states(steps)).toEqual(['ec2:done', 'done:done'])
    expect(isFlowComplete(steps)).toBe(true)
  })
})
