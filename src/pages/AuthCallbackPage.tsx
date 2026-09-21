import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeGithubCode } from '@/api/auth'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/AuthContext'
import { OAUTH_STATE_KEY } from '@/features/auth/oauth'
import { sessionStore } from '@/lib/storage'

export function AuthCallbackPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  // GitHub code 는 한 번만 쓸 수 있어서 StrictMode 의 이중 실행에도 교환은 한 번만 한다.
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const code = params.get('code')
    const state = params.get('state')
    const expected = sessionStore.get(OAUTH_STATE_KEY)
    sessionStore.remove(OAUTH_STATE_KEY)

    if (!code || !state || state !== expected) {
      setError('로그인 요청이 유효하지 않아요. 다시 시도해 주세요.')
      return
    }

    exchangeGithubCode(code)
      .then((session) => {
        login(session)
        navigate('/server', { replace: true })
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : '로그인에 실패했어요.')
      })
  }, [params, login, navigate])

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4">
      <Card className="w-full max-w-[400px] p-8 text-center">
        {error ? (
          <>
            <h1 className="text-lg font-medium">로그인하지 못했어요</h1>
            <p className="mt-2 text-sm text-muted" role="alert">
              {error}
            </p>
            <Link to="/login" className="mt-6 inline-block text-sm text-primary hover:underline">
              로그인 화면으로 돌아가기
            </Link>
          </>
        ) : (
          <p role="status" className="flex items-center justify-center gap-2 text-sm text-muted">
            <Spinner /> GitHub 인증을 확인하는 중이에요…
          </p>
        )}
      </Card>
    </main>
  )
}
