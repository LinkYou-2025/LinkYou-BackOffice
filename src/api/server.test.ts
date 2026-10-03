import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSwitchServerApi } from './server'

function stubFetch(status: number, body: unknown) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('스위치 API', () => {
  it('상태 조회는 secret 을 쿼리로 보내고 EC2 상태만 채운다', async () => {
    const fetchMock = stubFetch(200, { state: 'running' })

    const status = await createSwitchServerApi('s e&cret').getStatus()

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('/status?secret=s%20e%26cret')
    expect(new Headers(init.headers).has('Authorization')).toBe(false)
    expect(status).toMatchObject({ ec2: 'running', app: 'unknown', monitoring: 'unknown' })
  })

  it('모르는 상태값은 unknown 으로 처리한다', async () => {
    stubFetch(200, { state: 'terminated' })

    await expect(createSwitchServerApi('k').getStatus()).resolves.toMatchObject({ ec2: 'unknown' })
  })

  it('켜기와 끄기는 본문 없이 POST 로 호출한다 (preflight 를 피한다)', async () => {
    const fetchMock = stubFetch(200, { message: 'ok' })
    const api = createSwitchServerApi('k')

    await api.start()
    await api.stop('사유는 보내지 않는다')

    const calls = fetchMock.mock.calls as unknown as [string, RequestInit][]
    expect(calls[0][0]).toContain('/start?secret=k')
    expect(calls[1][0]).toContain('/stop?secret=k')
    for (const [, init] of calls) {
      expect(init.method).toBe('POST')
      expect(init.body).toBeUndefined()
    }
  })

  it('secret 이 틀리면 서버 메시지로 실패한다', async () => {
    stubFetch(403, { message: 'forbidden' })

    await expect(createSwitchServerApi('bad').getStatus()).rejects.toMatchObject({ status: 403 })
  })

  it('이력은 비어 있다', async () => {
    await expect(createSwitchServerApi('k').getHistory()).resolves.toEqual([])
  })
})
