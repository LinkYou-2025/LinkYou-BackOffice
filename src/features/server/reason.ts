export const REASON_MIN = 2
export const REASON_MAX = 100

/** 앞뒤 공백을 지우고 연속 공백과 줄바꿈을 한 칸으로 정리, 서버 검증과 같은 규칙 */
export function normalizeReason(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function isValidReason(value: string) {
  const { length } = normalizeReason(value)
  return length >= REASON_MIN && length <= REASON_MAX
}
