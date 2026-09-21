import type { AppHealth, Ec2State, HistoryAction, MonitoringState } from '@/api/types'
import type { Tone } from '@/components/ui/Badge'

export interface LabelInfo {
  label: string
  tone: Tone
  /** 배지에 보여줄 원본 상태값 */
  code: string
}

export const EC2_LABELS: Record<Ec2State, LabelInfo> = {
  running: { label: '실행 중', tone: 'success', code: 'running' },
  pending: { label: '시작 중', tone: 'warning', code: 'pending' },
  stopping: { label: '중지 중', tone: 'warning', code: 'stopping' },
  stopped: { label: '중지됨', tone: 'neutral', code: 'stopped' },
  unknown: { label: '알 수 없음', tone: 'neutral', code: 'unknown' },
}

export const APP_LABELS: Record<AppHealth, LabelInfo> = {
  up: { label: '정상', tone: 'success', code: 'up' },
  down: { label: '응답 없음', tone: 'danger', code: 'down' },
  unknown: { label: '확인 불가', tone: 'neutral', code: 'unknown' },
}

/** EC2 가 꺼져 있으면 앱 헬스는 의미가 없으므로 빨간 "응답 없음" 대신 중립 표시를 쓴다. */
export const APP_OFFLINE: LabelInfo = { label: '서버 꺼짐', tone: 'neutral', code: 'offline' }

export const MONITORING_LABELS: Record<MonitoringState, LabelInfo> = {
  active: { label: '수집 중', tone: 'success', code: 'active' },
  muted: { label: '알람 무음', tone: 'warning', code: 'muted' },
  unknown: { label: '확인 불가', tone: 'neutral', code: 'unknown' },
}

export const UNAVAILABLE: LabelInfo = { label: '확인 불가', tone: 'neutral', code: 'unknown' }

export const HISTORY_ACTION_LABELS: Record<HistoryAction, string> = {
  START: '서버 켜기',
  STOP: '서버 끄기',
  LOGIN: '로그인',
  LOGIN_DENIED: '로그인 거부',
}
