import { ApiError } from './client'
import type {
  AuthSession,
  HistoryAction,
  HistoryItem,
  ServerApi,
  ServerStatus,
} from './types'

/*
 * 백엔드 없이 화면을 개발하기 위한 메모리 mock.
 * 실제 Lambda 와 같은 순서로 상태가 바뀌도록 흉내 낸다.
 *   STOP : 모니터링 무음 → EC2 stopping → stopped
 *   START: EC2 pending → running → 앱 up → 모니터링 active
 */

const MOCK_USER = 'octocat'

type MockState = Pick<ServerStatus, 'ec2' | 'app' | 'monitoring'>

const state: MockState = { ec2: 'running', app: 'up', monitoring: 'active' }

const history: HistoryItem[] = [
  { id: 'seed-3', at: minutesAgo(35), user: 'octocat', action: 'START', result: 'SUCCESS' },
  { id: 'seed-2', at: minutesAgo(600), user: 'hubot', action: 'STOP', result: 'SUCCESS' },
  { id: 'seed-1', at: minutesAgo(610), user: 'hubot', action: 'LOGIN', result: 'SUCCESS' },
]

let seq = 0

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function later(ms: number, fn: () => void) {
  setTimeout(fn, ms)
}

function record(action: HistoryAction) {
  history.unshift({
    id: `mock-${++seq}`,
    at: new Date().toISOString(),
    user: MOCK_USER,
    action,
    result: 'SUCCESS',
  })
}

export const mockServerApi: ServerApi = {
  async getStatus() {
    await delay(200)
    return { ...state, updatedAt: new Date().toISOString() }
  },

  async start() {
    await delay(300)
    if (state.ec2 !== 'stopped') {
      throw new ApiError(409, '서버가 이미 켜져 있거나 전환 중이에요.')
    }
    record('START')
    state.ec2 = 'pending'
    later(3_000, () => {
      state.ec2 = 'running'
    })
    later(6_000, () => {
      state.app = 'up'
    })
    later(8_000, () => {
      state.monitoring = 'active'
    })
  },

  async stop() {
    await delay(300)
    if (state.ec2 !== 'running') {
      throw new ApiError(409, '서버가 이미 꺼져 있거나 전환 중이에요.')
    }
    record('STOP')
    state.monitoring = 'muted'
    later(1_500, () => {
      state.ec2 = 'stopping'
    })
    later(5_000, () => {
      state.ec2 = 'stopped'
      state.app = 'unknown'
    })
  },

  async getHistory(limit = 20) {
    await delay(200)
    return history.slice(0, limit)
  },
}

export async function mockLogin(): Promise<AuthSession> {
  await delay(400)
  return { token: 'mock-token', user: { login: MOCK_USER, avatarUrl: '' } }
}
