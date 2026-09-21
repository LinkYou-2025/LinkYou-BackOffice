import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

interface PlaceholderPageProps {
  title: string
  description: string
}

/** LinkU `/api/v1/admin/**` 연동 전까지 자리만 잡아 두는 화면. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="px-6 py-16 text-center">
        <p className="text-lg font-medium">준비 중이에요</p>
        <p className="mt-2 text-sm text-muted">LinkU 관리자 API 연동 후 추가될 예정이에요.</p>
      </Card>
    </>
  )
}
