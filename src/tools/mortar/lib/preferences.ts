/**
 * 计算设置与已填写坐标的本地持久化（浏览器 localStorage）。
 * 仅保存用户偏好与表单草稿，存储不可用时静默降级，不影响计算功能。
 */
import type { YAxisDirection } from './coordinates'

const STORAGE_KEYS = {
  metersPerUnit: 'wardogs:mortar:metersPerUnit',
  yAxisDirection: 'wardogs:mortar:yAxisDirection',
  coordinates: 'wardogs:mortar:coordinates',
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

/** 表单中已填写的四个坐标（未解析的原始字符串）。 */
export interface MortarCoordinates {
  mortarX: string
  mortarY: string
  targetX: string
  targetY: string
}

const COORDINATE_FIELDS = ['mortarX', 'mortarY', 'targetX', 'targetY'] as const

/**
 * 读取上次填写的坐标。
 * 存储内容来自本地但可能被手工修改，逐字段校验，仅接受字符串值。
 */
export function loadCoordinates(): Partial<MortarCoordinates> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.coordinates)
    if (raw === null) {
      return {}
    }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return {}
    }
    const coordinates: Partial<MortarCoordinates> = {}
    const record = parsed as Record<string, unknown>
    for (const field of COORDINATE_FIELDS) {
      const value = record[field]
      if (typeof value === 'string') {
        coordinates[field] = value
      }
    }
    return coordinates
  } catch {
    return {}
  }
}

/**
 * 保存当前填写的坐标，供刷新页面后恢复。
 * 四个坐标全部为空时移除存储项，不保留空草稿。
 */
export function saveCoordinates(coordinates: MortarCoordinates): void {
  try {
    if (COORDINATE_FIELDS.every((field) => coordinates[field].trim() === '')) {
      localStorage.removeItem(STORAGE_KEYS.coordinates)
      return
    }
    localStorage.setItem(STORAGE_KEYS.coordinates, JSON.stringify(coordinates))
  } catch {
    // 忽略写入失败（如隐私模式），坐标不持久化但功能不受影响
  }
}
