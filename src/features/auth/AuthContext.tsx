import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { configureApiClient } from '@/api/client'
import type { AuthSession } from '@/api/types'
import { useToast } from '@/components/ui/Toast'
import { sessionStore } from '@/lib/storage'

const SESSION_KEY = 'linku.backoffice.session'

interface AuthContextValue {
  session: AuthSession | null
  login: (session: AuthSession) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false
  const { token, user } = value as Partial<AuthSession>
  return typeof token === 'string' && typeof user?.login === 'string' && typeof user.avatarUrl === 'string'
}

function loadSession(): AuthSession | null {
  const raw = sessionStore.get(SESSION_KEY)
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [session, setSession] = useState<AuthSession | null>(loadSession)
  const tokenRef = useRef<string | null>(session?.token ?? null)

  const login = useCallback((next: AuthSession) => {
    tokenRef.current = next.token
    sessionStore.set(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    tokenRef.current = null
    sessionStore.remove(SESSION_KEY)
    setSession(null)
    queryClient.clear()
  }, [queryClient])

  // 자식의 첫 요청(useEffect)보다 먼저 토큰 getter 가 연결되도록 layout effect 로 등록한다.
  useLayoutEffect(() => {
    configureApiClient({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        if (!tokenRef.current) return
        logout()
        toast.info('로그인이 만료됐어요. 다시 로그인해 주세요.')
      },
    })
  }, [logout, toast])

  const value = useMemo(() => ({ session, login, logout }), [session, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있어요.')
  return ctx
}
