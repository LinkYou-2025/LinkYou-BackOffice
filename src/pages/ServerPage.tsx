import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/features/auth/AuthContext'
import { HistoryTable } from '@/features/server/HistoryTable'
import { ServerControlPanel } from '@/features/server/ServerControlPanel'
import { StatusCards } from '@/features/server/StatusCards'
import { useServerStatus } from '@/features/server/hooks'

export function ServerPage() {
  const { session } = useAuth()
  const status = useServerStatus()

  return (
    <>
      <PageHeader
        title="서버 제어"
        description={`${session?.user.login ?? ''}님, dev 서버를 켜고 끄고 상태를 확인할 수 있어요.`}
      />
      <StatusCards status={status.data} isLoading={status.isPending} />
      <ServerControlPanel status={status.data} isLoading={status.isPending} isError={status.isError} />
      <HistoryTable />
    </>
  )
}
