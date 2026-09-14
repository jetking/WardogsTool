import { describe, expect, it } from 'vitest'
import { formatAzimuthDegrees, formatDistance } from './format'

describe('formatDistance', () => {
  it('保留 1 位小数', () => {
    expect(formatDistance(5)).toBe('5.0')
    expect(formatDistance(123.456)).toBe('123.5')
  })
})

describe('formatAzimuthDegrees', () => {
  it('保留 1 位小数', () => {
    expect(formatAzimuthDegrees(36.8698976458)).toBe('36.9')
    expect(formatAzimuthDegrees(90)).toBe('90.0')
  })

  it('舍入到 360.0 时归一化为 0.0，保持范围有效', () => {
    expect(formatAzimuthDegrees(359.95)).toBe('0.0')
    expect(formatAzimuthDegrees(359.96)).toBe('0.0')
  })

  it('359.9 不会被错误归一化', () => {
    expect(formatAzimuthDegrees(359.94)).toBe('359.9')
  })
})
