/**
 * 通用二维几何计算，与游戏界面、存储完全解耦。
 *
 * 导航坐标系约定：x 轴向东为正，y 轴向北为正；
 * 方位角约定：正北为 0°，顺时针递增，归一化到 [0, 360)。
 */

/** 导航坐标系中的点。 */
export interface NavPoint {
  x: number
  y: number
}

/** 计算两点的欧氏距离（坐标单位）。 */
export function distanceBetween(a: NavPoint, b: NavPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/**
 * 计算从 from 指向 to 的方位角（度）。
 * 两点重合时方位无定义，返回 null。
 */
export function bearingDegrees(from: NavPoint, to: NavPoint): number | null {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (dx === 0 && dy === 0) {
    return null
  }
  return normalizeDegrees((Math.atan2(dx, dy) * 180) / Math.PI)
}

/** 将角度（度）归一化到 [0, 360)。 */
export function normalizeDegrees(degrees: number): number {
  const normalized = degrees % 360
  if (normalized === 0) {
    return 0
  }
  return normalized < 0 ? normalized + 360 : normalized
}

const COMPASS_POINT_16 = [
  '北',
  '北东北',
  '东北',
  '东东北',
  '东',
  '东东南',
  '东南',
  '南东南',
  '南',
  '南西南',
  '西南',
  '西西南',
  '西',
  '西西北',
  '西北',
  '北西北',
] as const

/** 将方位角（度）映射为十六方位中文名称。 */
export function compassPoint16(degrees: number): string {
  const normalized = normalizeDegrees(degrees)
  const index = Math.floor(((normalized + 11.25) % 360) / 22.5)
  return COMPASS_POINT_16[index]
}
