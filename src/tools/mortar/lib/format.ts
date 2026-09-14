/**
 * 显示格式化：中间计算保留完整精度，只在这里舍入。
 */
import { normalizeDegrees } from './geometry'

/** 长度值（米或坐标单位）显示为保留 1 位小数的字符串。 */
export function formatDistance(value: number): string {
  return value.toFixed(1)
}

/**
 * 方位角显示为保留 1 位小数的字符串。
 * 舍入后可能得到 360.0，需要再次归一化到 [0, 360)。
 */
export function formatAzimuthDegrees(degrees: number): string {
  const rounded = Math.round(degrees * 10) / 10
  return normalizeDegrees(rounded).toFixed(1)
}
