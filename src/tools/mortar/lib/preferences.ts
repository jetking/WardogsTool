/**
 * 计算设置的本地持久化（浏览器 localStorage）。
 * 仅保存用户偏好，存储不可用时静默降级，不影响计算功能。
 */
import type { YAxisDirection } from './coordinates'

const STORAGE_KEYS = {
  metersPerUnit: 'wardogs:mortar:metersPerUnit',
  yAxisDirection: 'wardogs:mortar:yAxisDirection',
} as const

export interface MortarPreferences {
  metersPerUnit?: string
  yAxisDirection?: YAxisDirection
}

export function loadPreferences(): MortarPreferences {
  try {
    const metersPerUnit = localStorage.getItem(STORAGE_KEYS.metersPerUnit) ?? undefined
    const yAxisRaw = localStorage.getItem(STORAGE_KEYS.yAxisDirection)
    return {
      metersPerUnit,
      yAxisDirection: yAxisRaw === 'down' ? 'down' : yAxisRaw === 'up' ? 'up' : undefined,
    }
  } catch {
    return {}
  }
}

export function savePreferences(preferences: Required<MortarPreferences>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.metersPerUnit, preferences.metersPerUnit)
    localStorage.setItem(STORAGE_KEYS.yAxisDirection, preferences.yAxisDirection)
  } catch {
    // 忽略写入失败（如隐私模式），偏好不持久化但功能不受影响
  }
}
