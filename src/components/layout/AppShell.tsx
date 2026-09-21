import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="min-w-0 flex-1 px-[46px] pt-9 pb-16">
        <div className="mx-auto flex max-w-[1046px] flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
