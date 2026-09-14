import { describe, expect, it } from 'vitest'
import {
  COORDINATE_LIMIT,
  computeMortarSolution,
  DEFAULT_METERS_PER_UNIT,
  parseCoordinate,
  parseMetersPerUnit,
  type MortarInput,
} from './calculate'

const baseInput: MortarInput = {
  mortarX: '0',
  mortarY: '0',
  targetX: '3',
  targetY: '4',
  metersPerUnit: '1',
}

describe('computeMortarSolution', () => {
  it('默认比例尺固定为社区校准的 100 米/坐标单位（2026-09 核实）', () => {
    expect(DEFAULT_METERS_PER_UNIT).toBe(100)
  })

  it('有效输入返回距离与方位角', () => {
    const result = computeMortarSolution(baseInput, { yAxisDirection: 'up' })
    if (!result.ok) throw new Error('应计算成功')
    expect(result.solution.distanceUnits).toBe(5)
    expect(result.solution.distanceMeters).toBe(5)
    expect(result.solution.azimuthDegrees).toBeCloseTo(36.8698976458, 8)
  })

  it('比例尺换算：10 坐标单位 × 2.5 米 = 25 米', () => {
    const result = computeMortarSolution(
      { ...baseInput, targetX: '6', targetY: '8', metersPerUnit: '2.5' },
      { yAxisDirection: 'up' },
    )
    if (!result.ok) throw new Error('应计算成功')
    expect(result.solution.distanceUnits).toBe(10)
    expect(result.solution.distanceMeters).toBe(25)
  })

  it('同点：距离为 0，方位角为 null', () => {
    const result = computeMortarSolution(
      { ...baseInput, targetX: '0', targetY: '0' },
      { yAxisDirection: 'up' },
    )
    if (!result.ok) throw new Error('应计算成功')
    expect(result.solution.distanceUnits).toBe(0)
    expect(result.solution.azimuthDegrees).toBeNull()
  })

  it('支持负数与小数坐标', () => {
    const result = computeMortarSolution(
      { ...baseInput, mortarX: '-1.5', mortarY: '-1.5', targetX: '1.5', targetY: '1.5' },
      { yAxisDirection: 'up' },
    )
    if (!result.ok) throw new Error('应计算成功')
    expect(result.solution.azimuthDegrees).toBeCloseTo(45, 10)
  })

  it('Y 轴向下时方位随之翻转', () => {
    // 屏幕惯例下目标 y=4 在迫击炮「下方」，应指向正南
    const result = computeMortarSolution(
      { ...baseInput, targetX: '0', targetY: '4' },
      { yAxisDirection: 'down' },
    )
    if (!result.ok) throw new Error('应计算成功')
    expect(result.solution.azimuthDegrees).toBe(180)
  })

  it('非法输入返回逐字段错误且不产生结果', () => {
    const result = computeMortarSolution(
      { mortarX: '', mortarY: 'abc', targetX: '0', targetY: '0', metersPerUnit: '0' },
      { yAxisDirection: 'up' },
    )
    if (result.ok) throw new Error('应计算失败')
    expect(result.fieldErrors.mortarX).toBe('请输入坐标')
    expect(result.fieldErrors.mortarY).toBe('坐标必须是数字')
    expect(result.fieldErrors.metersPerUnit).toBe('比例尺必须大于 0')
    expect(result.fieldErrors.targetX).toBeUndefined()
    expect(result.fieldErrors.targetY).toBeUndefined()
  })
})

describe('parseCoordinate', () => {
  it('拒绝空值与纯空白', () => {
    expect(parseCoordinate('')).toEqual({ ok: false, error: '请输入坐标' })
    expect(parseCoordinate('   ')).toEqual({ ok: false, error: '请输入坐标' })
  })

  it('拒绝非数字', () => {
    expect(parseCoordinate('abc')).toEqual({ ok: false, error: '坐标必须是数字' })
    expect(parseCoordinate('1,5')).toEqual({ ok: false, error: '坐标必须是数字' })
  })

  it('拒绝十六进制等写法', () => {
    expect(parseCoordinate('0x10')).toEqual({ ok: false, error: '坐标必须是数字' })
  })

  it('拒绝非有限数', () => {
    expect(parseCoordinate('1e999')).toEqual({ ok: false, error: '坐标必须是有限数字' })
    expect(parseCoordinate('Infinity')).toEqual({ ok: false, error: '坐标必须是数字' })
  })

  it('拒绝超出范围的值', () => {
    const result = parseCoordinate(String(COORDINATE_LIMIT + 1))
    expect(result).toEqual({ ok: false, error: `坐标超出允许范围（±${COORDINATE_LIMIT}）` })
  })

  it('接受合法的小数、负数和科学计数法', () => {
    expect(parseCoordinate('-12.5')).toEqual({ ok: true, value: -12.5 })
    expect(parseCoordinate(' .5 ')).toEqual({ ok: true, value: 0.5 })
    expect(parseCoordinate('1e3')).toEqual({ ok: true, value: 1000 })
  })
})

describe('parseMetersPerUnit', () => {
  it('拒绝 0 与负数', () => {
    expect(parseMetersPerUnit('0')).toEqual({ ok: false, error: '比例尺必须大于 0' })
    expect(parseMetersPerUnit('-2')).toEqual({ ok: false, error: '比例尺必须大于 0' })
  })

  it('接受正的小数', () => {
    expect(parseMetersPerUnit('2.5')).toEqual({ ok: true, value: 2.5 })
  })
})
