import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="페이지를 찾을 수 없어요" />
      <Card className="px-6 py-16 text-center">
        <p className="text-sm text-muted">주소가 바뀌었거나 없는 페이지예요.</p>
        <Link to="/server" className="mt-4 inline-block text-sm text-primary hover:underline">
          서버 제어로 돌아가기
        </Link>
      </Card>
    </>
  )
}
