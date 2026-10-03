import { request, SWITCH_MODE, USE_MOCK } from './client'
import { mockServerApi } from './mock'
import type { Ec2State, ServerApi, ServerStatus } from './types'

const httpServerApi: ServerApi = {
  getStatus: () => request('/status'),
  start: () => request('/start', { method: 'POST' }),
  stop: (reason) => request('/stop', { method: 'POST', body: JSON.stringify({ reason }) }),
  getHistory: (limit = 20) => request(`/history?limit=${limit}`),
}

const EC2_STATES: readonly Ec2State[] = ['pending', 'running', 'stopping', 'stopped']

function toEc2State(value: unknown): Ec2State {
  return EC2_STATES.find((state) => state === value) ?? 'unknown'
}

/**
 * dev 서버 스위치 API. 공용 secret 을 쿼리스트링으로 보낸다. (로그인·JWT 없음)
 * Authorization 헤더와 JSON 본문을 보내지 않아야 CORS preflight 없이 호출된다.
 * 응답이 EC2 상태 하나뿐이라 앱 헬스와 모니터링은 알 수 없음으로 둔다.
 */
export function createSwitchServerApi(secret: string): ServerApi {
  const withSecret = (path: string) => `${path}?secret=${encodeURIComponent(secret)}`
  return {
    getStatus: async (): Promise<ServerStatus> => {
      const body = await request<{ state?: unknown }>(withSecret('/status'))
      return {
        ec2: toEc2State(body.state),
        app: 'unknown',
        monitoring: 'unknown',
        updatedAt: new Date().toISOString(),
      }
    },
    start: () => request(withSecret('/start'), { method: 'POST' }),
    stop: () => request(withSecret('/stop'), { method: 'POST' }),
    getHistory: async () => [],
  }
}

function selectServerApi(): ServerApi {
  if (USE_MOCK) return mockServerApi
  if (SWITCH_MODE) return createSwitchServerApi(import.meta.env.VITE_SWITCH_SECRET ?? '')
  return httpServerApi
}

export const serverApi: ServerApi = selectServerApi()
