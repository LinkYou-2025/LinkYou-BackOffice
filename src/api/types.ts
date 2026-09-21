/*
 * 백엔드(API Gateway + Lambda) 계약.
 * 팀원이 만든 Lambda 스펙이 확정되면 이 파일과 api/server.ts 만 맞추면 된다.
 */

export type Ec2State = 'pending' | 'running' | 'stopping' | 'stopped' | 'unknown'
export type AppHealth = 'up' | 'down' | 'unknown'
export type MonitoringState = 'active' | 'muted' | 'unknown'

export type ServerAction = 'START' | 'STOP'

export interface ServerStatus {
  ec2: Ec2State
  app: AppHealth
  monitoring: MonitoringState
  /** ISO-8601 */
  updatedAt: string
}

export type HistoryAction = ServerAction | 'LOGIN' | 'LOGIN_DENIED'

export interface HistoryItem {
  id: string
  /** ISO-8601 */
  at: string
  /** GitHub username */
  user: string
  action: HistoryAction
  result: 'SUCCESS' | 'FAILURE'
  /** 서버를 끈 사유 등 부가 설명, 없으면 생략 */
  reason?: string
}

export interface AuthUser {
  login: string
  avatarUrl: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface ServerApi {
  getStatus(): Promise<ServerStatus>
  start(): Promise<void>
  stop(reason: string): Promise<void>
  getHistory(limit?: number): Promise<HistoryItem[]>
}
