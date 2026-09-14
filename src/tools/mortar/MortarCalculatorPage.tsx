import { useId, useState, type FormEvent } from 'react'
import { CoordinateInput } from './components/CoordinateInput'
import { ResultPanel } from './components/ResultPanel'
import {
  computeMortarSolution,
  DEFAULT_METERS_PER_UNIT,
  type ComputeResult,
  type MortarField,
  type MortarInput,
} from './lib/calculate'
import type { YAxisDirection } from './lib/coordinates'
import { loadPreferences, savePreferences } from './lib/preferences'
import './mortar.css'

export function MortarCalculatorPage() {
  const yAxisSelectId = useId()
  const [input, setInput] = useState<MortarInput>(() => {
    const preferences = loadPreferences()
    return {
      mortarX: '',
      mortarY: '',
      targetX: '',
      targetY: '',
      metersPerUnit: preferences.metersPerUnit ?? String(DEFAULT_METERS_PER_UNIT),
    }
  })
  const [yAxisDirection, setYAxisDirection] = useState<YAxisDirection>(
    () => loadPreferences().yAxisDirection ?? 'up',
  )
  const [result, setResult] = useState<ComputeResult | null>(null)
  // 仅在用户真正修改过设置后才持久化，避免把未调整的默认值冻结进 localStorage，
  // 导致默认值更新后旧偏好继续覆盖新默认值
  const [settingsTouched, setSettingsTouched] = useState(false)

  const fieldErrors = result && !result.ok ? result.fieldErrors : {}

  const updateField = (field: MortarField) => (value: string) => {
    setInput((previous) => ({ ...previous, [field]: value }))
  }

  const updateSettingsField = (field: MortarField) => (value: string) => {
    setSettingsTouched(true)
    updateField(field)(value)
  }

  const handleYAxisChange = (value: YAxisDirection) => {
    setSettingsTouched(true)
    setYAxisDirection(value)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setResult(computeMortarSolution(input, { yAxisDirection }))
    if (settingsTouched) {
      savePreferences({ metersPerUnit: input.metersPerUnit, yAxisDirection })
    }
  }

  const handleReset = () => {
    // 比例尺属于计算设置，重置坐标时保留
    setInput((previous) => ({
      mortarX: '',
      mortarY: '',
      targetX: '',
      targetY: '',
      metersPerUnit: previous.metersPerUnit,
    }))
    setResult(null)
  }

  return (
    <>
      <h1>迫击炮计算器</h1>
      <p className="lead">
        输入迫击炮与目标的游戏内坐标，计算两点直线距离和从迫击炮指向目标的方位角。计算在浏览器本地完成，无需联网。
      </p>

      <form className="mortar-form" onSubmit={handleSubmit} noValidate>
        <div className="mortar-coords">
          <fieldset>
            <legend>迫击炮位置</legend>
            <div className="mortar-coords-grid">
              <CoordinateInput
                label="迫击炮 X 坐标"
                value={input.mortarX}
                onChange={updateField('mortarX')}
                error={fieldErrors.mortarX}
                placeholder="例如 80.00"
              />
              <CoordinateInput
                label="迫击炮 Y 坐标"
                value={input.mortarY}
                onChange={updateField('mortarY')}
                error={fieldErrors.mortarY}
                placeholder="例如 70.00"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>目标位置</legend>
            <div className="mortar-coords-grid">
              <CoordinateInput
                label="目标 X 坐标"
                value={input.targetX}
                onChange={updateField('targetX')}
                error={fieldErrors.targetX}
                placeholder="例如 83.00"
              />
              <CoordinateInput
                label="目标 Y 坐标"
                value={input.targetY}
                onChange={updateField('targetY')}
                error={fieldErrors.targetY}
                placeholder="例如 74.00"
              />
            </div>
          </fieldset>
        </div>

        <details className="mortar-settings">
          <summary>坐标与比例尺设置</summary>
          <div className="mortar-settings-body">
            <CoordinateInput
              label="比例尺（米/坐标单位）"
              value={input.metersPerUnit}
              onChange={updateSettingsField('metersPerUnit')}
              error={fieldErrors.metersPerUnit}
            />
            <div className="field">
              <label htmlFor={yAxisSelectId}>坐标 Y 轴方向</label>
              <select
                id={yAxisSelectId}
                value={yAxisDirection}
                onChange={(event) => handleYAxisChange(event.target.value as YAxisDirection)}
              >
                <option value="up">Y 向北递增（默认，与社区校准一致）</option>
                <option value="down">Y 向南递增（屏幕惯例）</option>
              </select>
            </div>
            <p className="mortar-settings-note">
              默认值与社区校准数据一致（2026-09，Beta 2 / 抢先体验初期）：1 坐标单位 = 100
              米（坐标范围 0–160，两位小数，0.01 = 1 米），X 向东为正、Y 向北递增。官方未公布这些参数，
              版本更新后请对照游戏内已知距离重新验证，如有出入可在此调整。
            </p>
          </div>
        </details>

        <div className="mortar-actions">
          <button type="submit" className="btn btn-primary">
            计算
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
        </div>
      </form>

      {result?.ok ? (
        <ResultPanel
          solution={result.solution}
          metersPerUnit={Number(input.metersPerUnit)}
          yAxisDirection={yAxisDirection}
        />
      ) : null}
    </>
  )
}
