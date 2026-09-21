import { sessionStore } from '@/lib/storage'

export const OAUTH_STATE_KEY = 'linku.backoffice.oauthState'

/**
 * GitHub 인증 URL 을 만들고 CSRF 방지용 state 를 저장한다.
 * `read:org` 는 Lambda 가 조직 소속(GET /user/memberships/orgs/{org})을 확인할 때 필요하다.
 * client id 가 없으면 null.
 */
export function buildGithubAuthorizeUrl(): string | null {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
  if (!clientId) return null

  const state = crypto.randomUUID()
  sessionStore.set(OAUTH_STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'read:org',
    state,
    redirect_uri: `${window.location.origin}/auth/callback`,
  })
  return `https://github.com/login/oauth/authorize?${params}`
}
