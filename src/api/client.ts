export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** true 일 때만 mock 을 쓴다. 값이 비어 있다고 몰래 mock 으로 떨어지지 않게 한다. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

interface ClientHandlers {
  getToken: () => string | null
  onUnauthorized: () => void
}

let handlers: ClientHandlers = {
  getToken: () => null,
  onUnauthorized: () => {},
}

export function configureApiClient(next: ClientHandlers) {
  handlers = next
}

async function readErrorMessage(res: Response) {
  try {
    const body: unknown = await res.json()
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message
    }
  } catch {
    // 본문이 JSON 이 아니면 기본 문구를 쓴다.
  }
  return `요청에 실패했어요. (${res.status})`
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')

  const token = handlers.getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.')
  }

  // Lambda authorizer 가 토큰을 거부하면 API Gateway 는 401 이 아니라 403 을 돌려줌
  // 토큰 없이 보내는 로그인 요청의 403 은 조직 멤버가 아니라는 뜻이라 세션 만료로 보지 않음
  const sessionRejected = res.status === 401 || (res.status === 403 && token !== null)
  if (sessionRejected) {
    handlers.onUnauthorized()
    throw new ApiError(401, '로그인이 만료됐어요. 다시 로그인해 주세요.')
  }
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
