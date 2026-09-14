/**
 * 迫击炮计算的输入校验与求解编排。
 * 仅依赖几何模块与坐标适配层，不依赖界面与存储。
 */
import { bearingDegrees, distanceBetween } from './geometry'
import { gameToNav, unitsToMeters, type CoordinateAdapterOptions } from './coordinates'

/**
 * 坐标输入允许的最大绝对值。
 * 游戏实际地图范围尚未核实，这里只用作防止误输入的宽松安全边界。
 */
export const COORDINATE_LIMIT = 1_000_000

/** 比例尺允许的最大值（米/坐标单位）。 */
export const SCALE_LIMIT = 1_000_000

/**
 * 默认地图比例尺：1 坐标单位 = 100 米。
 * 来源：社区校准数据——Bakurani / Ozeti 地图为 16×16 km，坐标范围 0–160，
 * 显示两位小数（0.01 = 1 米）；与 Beta 2 至抢先体验初期（2026-09）的社区攻略
 * 及开源计算器实现一致。官方未公布，版本更新后需重新验证。
 */
export const DEFAULT_METERS_PER_UNIT = 100

/** 计算表单中的原始输入（均为未解析的字符串）。 */
export interface MortarInput {
  mortarX: string
  mortarY: string
  targetX: string
  targetY: string
  metersPerUnit: string
}

/** 迫击炮射击解。 */
export interface MortarSolution {
  /** 两点直线距离（坐标单位）。 */
  distanceUnits: number
  /** 两点直线距离（米），按给定比例尺换算。 */
  distanceMeters: number
  /** 从迫击炮指向目标的方位角（度，正北 0° 顺时针）；两点重合时为 null。 */
  azimuthDegrees: number | null
}

export type MortarField = keyof MortarInput
export type FieldErrors = Partial<Record<MortarField, string>>

export type ComputeResult =
  | { ok: true; solution: MortarSolution }
  | { ok: false; fieldErrors: FieldErrors }

export type ComputeOptions = CoordinateAdapterOptions

type ParseResult = { ok: true; value: number } | { ok: false; error: string }

// 合法的小数形式：整数、小数、负数、科学计数法；拒绝十六进制、千分位等写法。
const DECIMAL_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/

function parseDecimalFinite(raw: string, label: string): ParseResult {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { ok: false, error: `请输入${label}` }
  }
  if (!DECIMAL_PATTERN.test(trimmed)) {
    return { ok: false, error: `${label}必须是数字` }
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    return { ok: false, error: `${label}必须是有限数字` }
  }
  return { ok: true, value }
}

/** 解析单个坐标输入：拒绝空值、非数字、非有限数和超出范围的值。 */
export function parseCoordinate(raw: string): ParseResult {
  const parsed = parseDecimalFinite(raw, '坐标')
  if (!parsed.ok) {
    return parsed
  }
  if (Math.abs(parsed.value) > COORDINATE_LIMIT) {
    return { ok: false, error: `坐标超出允许范围（±${COORDINATE_LIMIT}）` }
  }
  return parsed
}

/** 解析比例尺输入：必须为正的有限数字。 */
export function parseMetersPerUnit(raw: string): ParseResult {
  const parsed = parseDecimalFinite(raw, '比例尺')
  if (!parsed.ok) {
    return parsed
  }
  if (parsed.value <= 0) {
    return { ok: false, error: '比例尺必须大于 0' }
  }
  if (parsed.value > SCALE_LIMIT) {
    return { ok: false, error: `比例尺超出允许范围（最大 ${SCALE_LIMIT}）` }
  }
  return parsed
}

/**
 * 校验全部输入并计算射击解。
 * 任一输入非法时返回逐字段错误，不产生结果。
 */
export function computeMortarSolution(input: MortarInput, options: ComputeOptions): ComputeResult {
  const mortarX = parseCoordinate(input.mortarX)
  const mortarY = parseCoordinate(input.mortarY)
  const targetX = parseCoordinate(input.targetX)
  const targetY = parseCoordinate(input.targetY)
  const metersPerUnit = parseMetersPerUnit(input.metersPerUnit)

  if (!mortarX.ok || !mortarY.ok || !targetX.ok || !targetY.ok || !metersPerUnit.ok) {
    const fieldErrors: FieldErrors = {}
    if (!mortarX.ok) fieldErrors.mortarX = mortarX.error
    if (!mortarY.ok) fieldErrors.mortarY = mortarY.error
    if (!targetX.ok) fieldErrors.targetX = targetX.error
    if (!targetY.ok) fieldErrors.targetY = targetY.error
    if (!metersPerUnit.ok) fieldErrors.metersPerUnit = metersPerUnit.error
    return { ok: false, fieldErrors }
  }

  const mortar = gameToNav({ x: mortarX.value, y: mortarY.value }, options)
  const target = gameToNav({ x: targetX.value, y: targetY.value }, options)
  const distanceUnits = distanceBetween(mortar, target)

  return {
    ok: true,
    solution: {
      distanceUnits,
      distanceMeters: unitsToMeters(distanceUnits, metersPerUnit.value),
      azimuthDegrees: bearingDegrees(mortar, target),
    },
  }
}
