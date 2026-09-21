import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  /** 설명 아래에 넣을 추가 입력 영역 (예: 사유 입력) */
  children?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  loading?: boolean
  /** 입력이 올바르지 않을 때 확인 버튼 비활성화 */
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** 네이티브 <dialog> 를 써서 포커스 트랩, Esc 닫기, 스크린리더 처리를 브라우저에 맡긴다. */
export function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = '취소',
  tone = 'primary',
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        if (!loading) onCancel()
      }}
      onClick={(event) => {
        // 바깥(backdrop) 클릭은 target 이 dialog 자신이다.
        if (event.target === ref.current && !loading) onCancel()
      }}
      className="m-auto w-[min(420px,calc(100vw-32px))] rounded-lg border border-border bg-surface p-0 text-white shadow-panel backdrop:bg-black/60"
    >
      <div className="p-6">
        <h2 className="text-lg font-medium">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-muted">{description}</div>
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
