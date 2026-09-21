import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { exchangeGithubCode } from '@/api/auth'
import { USE_MOCK } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { buildGithubAuthorizeUrl } from '@/features/auth/oauth'

export function LoginPage() {
  const { session, login } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/server" replace />

  async function handleLogin() {
    if (USE_MOCK) {
      setLoading(true)
      try {
        login(await exchangeGithubCode('mock'))
      } finally {
        setLoading(false)
      }
      return
    }

    const url = buildGithubAuthorizeUrl()
    if (!url) {
      toast.error('GitHub Client ID 가 설정되지 않았어요. (VITE_GITHUB_CLIENT_ID)')
      return
    }
    window.location.assign(url)
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4">
      <Card className="w-full max-w-[400px] p-8 shadow-panel">
        <div className="flex items-center gap-1.5">
          <img src="/logo.svg" alt="" width={20} height={21} />
          <span className="text-xl leading-[22px] font-medium">LinkU BackOffice</span>
        </div>

        <h1 className="mt-8 text-2xl leading-8 font-medium">로그인</h1>
        <p className="mt-2 text-sm text-muted">LinkYou GitHub 조직 멤버만 접근할 수 있어요.</p>

        <Button size="lg" className="mt-8 w-full" loading={loading} onClick={handleLogin}>
          GitHub로 로그인
        </Button>

        {USE_MOCK && (
          <p className="mt-4 text-xs text-subtle">개발용 mock 모드예요. 실제 GitHub 로그인은 하지 않아요.</p>
        )}
      </Card>
    </main>
  )
}
