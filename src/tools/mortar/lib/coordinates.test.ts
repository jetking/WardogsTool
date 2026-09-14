import { describe, expect, it } from 'vitest'
import { gameToNav, unitsToMeters } from './coordinates'
import { bearingDegrees } from './geometry'

describe('gameToNav', () => {
  it('Y 轴向北递增时坐标保持不变', () => {
    expect(gameToNav({ x: 3, y: 4 }, { yAxisDirection: 'up' })).toEqual({ x: 3, y: 4 })
  })

  it('Y 轴向下（向南递增）时翻转 Y 符号', () => {
    expect(gameToNav({ x: 3, y: 4 }, { yAxisDirection: 'down' })).toEqual({ x: 3, y: -4 })
  })

  it('轴翻转影响方位：屏幕坐标中 Y 更小的点代表北方', () => {
    // 屏幕惯例下，目标在迫击炮「上方」（y 更小）应指向正北 0°
    const mortar = gameToNav({ x: 100, y: 100 }, { yAxisDirection: 'down' })
    const target = gameToNav({ x: 100, y: 90 }, { yAxisDirection: 'down' })
    expect(bearingDegrees(mortar, target)).toBe(0)
  })

  it('X 轴不受 Y 轴方向影响', () => {
    const mortar = gameToNav({ x: 100, y: 100 }, { yAxisDirection: 'down' })
    const target = gameToNav({ x: 110, y: 100 }, { yAxisDirection: 'down' })
    expect(bearingDegrees(mortar, target)).toBe(90)
  })
})

describe('unitsToMeters', () => {
  it('按比例尺换算', () => {
    expect(unitsToMeters(10, 2.5)).toBe(25)
  })

  it('比例尺为 1 时保持不变', () => {
    expect(unitsToMeters(123.4, 1)).toBeCloseTo(123.4, 10)
  })
})
