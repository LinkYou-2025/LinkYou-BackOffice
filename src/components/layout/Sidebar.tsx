import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, LogOut, Server, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { USE_MOCK } from '@/api/client'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/cn'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

const ROW = 'flex h-[42px] items-center gap-1.5 text-sm font-medium transition-colors'

interface SidebarLinkProps {
  to: string
  icon: LucideIcon
  children: ReactNode
}

function SidebarLink({ to, icon: Icon, children }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(ROW, isActive ? 'text-primary' : 'text-muted hover:text-white')}
    >
      <Icon size={14} aria-hidden="true" />
      {children}
    </NavLink>
  )
}

const serviceItems = [
  { to: '/admin/users', label: '유저' },
  { to: '/admin/curations', label: '큐레이션' },
  { to: '/admin/blogs', label: '블로그' },
]

function ServiceGroup() {
  const { pathname } = useLocation()
  const isActive = pathname.startsWith('/admin')
  const [open, setOpen] = useState(isActive)

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(ROW, 'w-full', isActive ? 'text-primary' : 'text-muted hover:text-white')}
      >
        <Users size={14} aria-hidden="true" />
        <span>서비스 운영</span>
        {open ? (
          <ChevronDown size={12} className="ml-auto" aria-hidden="true" />
        ) : (
          <ChevronRight size={12} className="ml-auto" aria-hidden="true" />
        )}
      </button>

      {open && (
        <ul className="mt-2 flex flex-col">
          {serviceItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive: active }) =>
                  cn(
                    'relative flex h-[42px] items-center rounded px-3.5 text-sm font-medium transition-colors',
                    active ? 'bg-surface-alt text-white' : 'text-muted hover:text-white',
                  )
                }
              >
                {({ isActive: active }) => (
                  <>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-[3px] rounded-l bg-primary"
                      />
                    )}
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Sidebar() {
  const { session, logout } = useAuth()

  return (
    <aside className="sticky top-0 flex h-screen w-[300px] shrink-0 flex-col border-r border-border/40 bg-bg shadow-panel">
      <div className="px-7 pt-9">
        <div className="flex items-center gap-1.5">
          <img src="/logo.svg" alt="" width={20} height={21} />
          <span className="text-xl leading-[22px] font-medium whitespace-nowrap">LinkU BackOffice</span>
        </div>
        {USE_MOCK && (
          <Badge tone="warning" dot={false} className="mt-2">
            MOCK 모드
          </Badge>
        )}
      </div>

      <nav aria-label="주 메뉴" className="mt-14 flex flex-col gap-1 px-7">
        <SidebarLink to="/server" icon={Server}>
          서버 제어
        </SidebarLink>
        <ServiceGroup />
      </nav>

      {session && (
        <div className="mt-auto border-t border-border/40 px-7 py-6">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 text-left"
            aria-label={`${session.user.login} 로그아웃`}
          >
            <Avatar name={session.user.login} src={session.user.avatarUrl} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm leading-[14px]">{session.user.login}</span>
              <span className="mt-1 block text-xs leading-[14px] text-muted">로그아웃</span>
            </span>
            <LogOut size={14} className="text-muted" aria-hidden="true" />
          </button>
        </div>
      )}
    </aside>
  )
}
