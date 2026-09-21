import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serverApi } from '@/api/server'
import type { ServerAction } from '@/api/types'

/** 상태 자동 갱신 주기. (탭이 백그라운드면 react-query 가 알아서 멈춘다) */
export const STATUS_POLL_MS = 4_000
const HISTORY_POLL_MS = 15_000
export const HISTORY_LIMIT = 20

export function useServerStatus() {
  return useQuery({
    queryKey: ['server', 'status'],
    queryFn: () => serverApi.getStatus(),
    refetchInterval: STATUS_POLL_MS,
  })
}

export function useServerHistory() {
  return useQuery({
    queryKey: ['server', 'history'],
    queryFn: () => serverApi.getHistory(HISTORY_LIMIT),
    refetchInterval: HISTORY_POLL_MS,
  })
}

export function useServerAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ action, reason }: { action: ServerAction; reason?: string }) =>
      action === 'START' ? serverApi.start() : serverApi.stop(reason ?? ''),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['server'] }),
  })
}
