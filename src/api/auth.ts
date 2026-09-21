import { request, USE_MOCK } from './client'
import { mockLogin } from './mock'
import type { AuthSession } from './types'

/**
 * GitHub OAuth `code` 를 Lambda 로 보내 세션 토큰으로 교환한다.
 * Lambda 가 code 교환 → 조직 소속 확인 → 자체 JWT 발급을 담당한다. (client secret 은 Lambda 에만 있다)
 */
export function exchangeGithubCode(code: string): Promise<AuthSession> {
  if (USE_MOCK) return mockLogin()
  return request<AuthSession>('/auth/github', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
