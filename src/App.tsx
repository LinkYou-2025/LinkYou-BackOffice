import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/features/auth/AuthContext'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { ServerPage } from '@/pages/ServerPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 2_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                  <Route index element={<Navigate to="/server" replace />} />
                  <Route path="/server" element={<ServerPage />} />
                  <Route
                    path="/admin/users"
                    element={<PlaceholderPage title="유저 관리" description="LinkU 서비스 유저를 조회하고 관리해요." />}
                  />
                  <Route
                    path="/admin/curations"
                    element={<PlaceholderPage title="큐레이션 관리" description="월간 큐레이션 생성 현황을 관리해요." />}
                  />
                  <Route
                    path="/admin/blogs"
                    element={<PlaceholderPage title="블로그 관리" description="블로그 데이터 수집 결과를 관리해요." />}
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
