import { describe, expect, it } from 'vitest'
import { isValidReason, normalizeReason, REASON_MAX, REASON_MIN } from './reason'

describe('normalizeReason', () => {
  it('앞뒤 공백을 지우고 연속 공백과 줄바꿈을 한 칸으로 정리한다', () => {
    expect(normalizeReason('  테스트   종료\n후 정리  ')).toBe('테스트 종료 후 정리')
  })
})

describe('isValidReason', () => {
  it('공백뿐이거나 비어 있으면 유효하지 않다', () => {
    expect(isValidReason('')).toBe(false)
    expect(isValidReason('     ')).toBe(false)
  })

  it('최소 길이 미만이면 유효하지 않고 최소 길이부터 유효하다', () => {
    expect(isValidReason('a'.repeat(REASON_MIN - 1))).toBe(false)
    expect(isValidReason('a'.repeat(REASON_MIN))).toBe(true)
  })

  it('공백은 길이에 포함하지 않고 정리한 뒤 센다', () => {
    expect(isValidReason(' 가   ')).toBe(false)
    expect(isValidReason(' 가나 ')).toBe(true)
  })

  it('최대 길이를 넘으면 유효하지 않다', () => {
    expect(isValidReason('a'.repeat(REASON_MAX))).toBe(true)
    expect(isValidReason('a'.repeat(REASON_MAX + 1))).toBe(false)
  })
})
