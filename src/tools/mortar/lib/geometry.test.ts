import { describe, expect, it } from 'vitest'
import {
  bearingDegrees,
  compassPoint16,
  distanceBetween,
  normalizeDegrees,
} from './geometry'

describe('distanceBetween', () => {
  it('计算 3-4-5 直角三角形距离', () => {
    expect(distanceBetween({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('同点距离为 0', () => {
    expect(distanceBetween({ x: 12, y: -7 }, { x: 12, y: -7 })).toBe(0)
  })

  it('距离与方向无关', () => {
    expect(distanceBetween({ x: 1, y: 2 }, { x: -2, y: 6 })).toBe(
      distanceBetween({ x: -2, y: 6 }, { x: 1, y: 2 }),
    )
  })
})

describe('bearingDegrees', () => {
  const origin = { x: 0, y: 0 }

  it('正北方向为 0°', () => {
    expect(bearingDegrees(origin, { x: 0, y: 10 })).toBe(0)
  })

  it('正东方向为 90°', () => {
    expect(bearingDegrees(origin, { x: 10, y: 0 })).toBe(90)
  })

  it('正南方向为 180°', () => {
    expect(bearingDegrees(origin, { x: 0, y: -10 })).toBe(180)
  })

  it('正西方向为 270°', () => {
    expect(bearingDegrees(origin, { x: -10, y: 0 })).toBe(270)
  })

  it('东北象限（第一象限）为 45°', () => {
    expect(bearingDegrees(origin, { x: 3, y: 3 })).toBeCloseTo(45, 10)
  })

  it('东南象限（第四象限）为 135°', () => {
    expect(bearingDegrees(origin, { x: 3, y: -3 })).toBeCloseTo(135, 10)
  })

  it('西南象限（第三象限）为 225°', () => {
    expect(bearingDegrees(origin, { x: -3, y: -3 })).toBeCloseTo(225, 10)
  })

  it('西北象限（第二象限）为 315°', () => {
    expect(bearingDegrees(origin, { x: -3, y: 3 })).toBeCloseTo(315, 10)
  })

  it('从任意点出发：东偏北 30° 方向的方位角为 60°', () => {
    // 与正东夹角 30° 即与正北夹角 60°：dx = sin60°，dy = cos60°
    const target = { x: 100 + Math.sin(Math.PI / 3), y: 50 + Math.cos(Math.PI / 3) }
    expect(bearingDegrees({ x: 100, y: 50 }, target)).toBeCloseTo(60, 10)
  })

  it('同点时方位无定义，返回 null', () => {
    expect(bearingDegrees({ x: 5, y: 5 }, { x: 5, y: 5 })).toBeNull()
  })
})

describe('normalizeDegrees', () => {
  it('负角度加上 360', () => {
    expect(normalizeDegrees(-90)).toBe(270)
  })

  it('360° 归一化为 0°', () => {
    expect(normalizeDegrees(360)).toBe(0)
  })

  it('超过 360° 取余', () => {
    expect(normalizeDegrees(725)).toBe(5)
  })

  it('-0 归一化为 0', () => {
    expect(Object.is(normalizeDegrees(-0), -0)).toBe(false)
    expect(normalizeDegrees(-0)).toBe(0)
  })

  it('[0, 360) 内的角度保持不变', () => {
    expect(normalizeDegrees(123.456)).toBe(123.456)
  })
})

describe('compassPoint16', () => {
  it('四个正方向', () => {
    expect(compassPoint16(0)).toBe('北')
    expect(compassPoint16(90)).toBe('东')
    expect(compassPoint16(180)).toBe('南')
    expect(compassPoint16(270)).toBe('西')
  })

  it('四个斜方向', () => {
    expect(compassPoint16(45)).toBe('东北')
    expect(compassPoint16(135)).toBe('东南')
    expect(compassPoint16(225)).toBe('西南')
    expect(compassPoint16(315)).toBe('西北')
  })

  it('区间边界：348.75° 起归为「北」', () => {
    expect(compassPoint16(348.75)).toBe('北')
    expect(compassPoint16(348.74)).toBe('北西北')
    expect(compassPoint16(11.25)).toBe('北东北')
    expect(compassPoint16(11.24)).toBe('北')
  })

  it('先归一化再映射', () => {
    expect(compassPoint16(-90)).toBe('西')
    expect(compassPoint16(360)).toBe('北')
  })
})
