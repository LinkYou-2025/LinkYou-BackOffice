import type { HistoryItem } from '@/api/types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/format'
import { HISTORY_LIMIT, useServerHistory } from './hooks'
import { HISTORY_ACTION_LABELS } from './labels'

const COLUMNS = ['사용자', '시각', '동작', '사유', '결과']

function Row({ item }: { item: HistoryItem }) {
  return (
    <tr className="odd:bg-surface-alt">
      <td className="px-6 py-3">
        <span className="flex items-center gap-2">
          <Avatar name={item.user} size={24} />
          {item.user}
        </span>
      </td>
      <td className="px-6 py-3 text-muted">{formatDateTime(item.at)}</td>
      <td className="px-6 py-3">{HISTORY_ACTION_LABELS[item.action]}</td>
      <td className="max-w-[260px] truncate px-6 py-3 text-muted" title={item.reason}>
        {item.reason ?? '-'}
      </td>
      <td className="px-6 py-3">
        <Badge tone={item.result === 'SUCCESS' ? 'success' : 'danger'}>
          {item.result === 'SUCCESS' ? '성공' : '실패'}
        </Badge>
      </td>
    </tr>
  )
}

function Message({ children }: { children: string }) {
  return (
    <tr>
      <td colSpan={COLUMNS.length} className="px-6 py-10 text-center text-muted">
        {children}
      </td>
    </tr>
  )
}

export function HistoryTable() {
  const { data, isPending, isError } = useServerHistory()

  let body
  if (isPending) {
    body = Array.from({ length: 3 }, (_, index) => (
      <tr key={index} aria-hidden="true" className="odd:bg-surface-alt">
        {COLUMNS.map((column) => (
          <td key={column} className="px-6 py-3">
            <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
          </td>
        ))}
      </tr>
    ))
  } else if (isError) {
    body = <Message>이력을 불러오지 못했어요.</Message>
  } else if (data.length === 0) {
    body = <Message>아직 기록이 없어요.</Message>
  } else {
    body = data.map((item) => <Row key={item.id} item={item} />)
  }

  return (
    <Card className="pt-6 pb-2">
      <div className="flex items-baseline justify-between px-6">
        <h2 className="text-lg font-medium">작업 이력</h2>
        <p className="text-xs text-subtle">최근 {HISTORY_LIMIT}건</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <caption className="sr-only">서버 제어 작업 이력</caption>
          <thead className="text-muted">
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} scope="col" className="px-6 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </Card>
  )
}
