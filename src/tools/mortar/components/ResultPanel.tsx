import type { MortarSolution } from '../lib/calculate'
import type { YAxisDirection } from '../lib/coordinates'
import { formatAzimuthDegrees, formatDistance } from '../lib/format'
import { compassPoint16 } from '../lib/geometry'

interface ResultPanelProps {
  solution: MortarSolution
  /** 本次换算实际使用的比例尺（米/坐标单位），显示以保持透明。 */
  metersPerUnit: number
  yAxisDirection: YAxisDirection
}

export function ResultPanel({ solution, metersPerUnit, yAxisDirection }: ResultPanelProps) {
  return (
    <section className="mortar-result" aria-live="polite" aria-label="计算结果">
      <h2>计算结果</h2>
      <dl>
        <div className="mortar-result-row">
          <dt>距离</dt>
          <dd>
            <strong>{formatDistance(solution.distanceMeters)}</strong> 米
            <span className="mortar-result-sub">
              （{formatDistance(solution.distanceUnits)} 坐标单位）
            </span>
          </dd>
        </div>
        <div className="mortar-result-row">
          <dt>方位角</dt>
          <dd>
            {solution.azimuthDegrees === null ? (
              <span>两点重合，方位无定义</span>
            ) : (
              <>
                <strong>{formatAzimuthDegrees(solution.azimuthDegrees)}°</strong>
                <span className="mortar-result-sub">
                  （{compassPoint16(solution.azimuthDegrees)}方向）
                </span>
              </>
            )}
          </dd>
        </div>
      </dl>
      <p className="mortar-result-note">
        方位角以正北为 0°，顺时针递增；距离按 {metersPerUnit} 米/坐标单位换算
        {yAxisDirection === 'down' ? '，Y 轴按向南递增处理' : ''}。
      </p>
    </section>
  )
}
