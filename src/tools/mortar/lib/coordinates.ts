/**
 * 坐标适配层：统一游戏坐标与内部导航坐标系。
 *
 * 坐标轴约定（X 向东为正、Y 向北递增）与社区校准数据及开源计算器实现
 * 一致（2026-09，Beta 2 / 抢先体验初期）；官方未公布，版本更新后需重新验证。
 * 详见 README「游戏数据核实状态」。
 */
import type { NavPoint } from './geometry'

/** 游戏内坐标，与游戏界面显示保持一致，未做任何轴变换。 */
export interface GamePoint {
  x: number
  y: number
}

/**
 * 游戏坐标 Y 轴方向：
 * - 'up'：Y 向北递增（数学惯例，与社区校准一致，默认）
 * - 'down'：Y 向南递增（屏幕/部分游戏惯例，Y 轴向下）
 */
export type YAxisDirection = 'up' | 'down'

export interface CoordinateAdapterOptions {
  yAxisDirection: YAxisDirection
}

/** 将游戏坐标转换为导航坐标系（x 东正、y 北正）。 */
export function gameToNav(point: GamePoint, options: CoordinateAdapterOptions): NavPoint {
  return {
    x: point.x,
    y: options.yAxisDirection === 'down' ? -point.y : point.y,
  }
}

/** 将坐标单位距离换算为米。metersPerUnit 为地图比例尺（米/坐标单位）。 */
export function unitsToMeters(distanceUnits: number, metersPerUnit: number): number {
  return distanceUnits * metersPerUnit
}
