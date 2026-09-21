import { request, USE_MOCK } from './client'
import { mockServerApi } from './mock'
import type { ServerApi } from './types'

const httpServerApi: ServerApi = {
  getStatus: () => request('/status'),
  start: () => request('/start', { method: 'POST' }),
  stop: (reason) => request('/stop', { method: 'POST', body: JSON.stringify({ reason }) }),
  getHistory: (limit = 20) => request(`/history?limit=${limit}`),
}

export const serverApi: ServerApi = USE_MOCK ? mockServerApi : httpServerApi
