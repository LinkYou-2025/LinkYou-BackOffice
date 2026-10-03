import { Navigate, Outlet } from 'react-router-dom'
import { SWITCH_MODE } from '@/api/client'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { session } = useAuth()
  // 스위치 API 모드는 로그인이 없다.
  if (!session && !SWITCH_MODE) return <Navigate to="/login" replace />
  return <Outlet />
}
