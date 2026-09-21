import { afterEach, describe, expect, it, vi } from 'vitest'
import { configureApiClient, request } from './client'

function respondWith(status: number, body: unknown = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  )
}

function setup(token: string | null) {
  const onUnauthorized = vi.fn()
  configureApiClient({ getToken: () => token, onUnauthorized })
  return onUnauthorized
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request 의 세션 만료 처리', () => {
  it('401 이면 세션 만료로 처리한다', async () => {
    const onUnauthorized = setup('token')
    respondWith(401)

    await expect(request('/status')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('토큰을 보냈는데 403 이면 authorizer 가 거부한 것이라 세션 만료로 처리한다', async () => {
    const onUnauthorized = setup('token')
    respondWith(403, { message: 'Forbidden' })

    await expect(request('/status')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('토큰 없이 보낸 로그인 요청의 403 은 세션 만료가 아니라 서버 메시지를 그대로 보여준다', async () => {
    const onUnauthorized = setup(null)
    respondWith(403, { message: 'LinkYou 조직 멤버만 접근할 수 있어요.' })

    await expect(request('/auth/github', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 403,
      message: 'LinkYou 조직 멤버만 접근할 수 있어요.',
    })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('409 같은 일반 오류는 세션 만료로 보지 않고 서버 메시지를 전달한다', async () => {
    const onUnauthorized = setup('token')
    respondWith(409, { message: '서버가 이미 꺼져 있거나 전환 중이에요.' })

    await expect(request('/stop', { method: 'POST' })).rejects.toMatchObject({
      status: 409,
      message: '서버가 이미 꺼져 있거나 전환 중이에요.',
    })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})
