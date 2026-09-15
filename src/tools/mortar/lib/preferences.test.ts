import { beforeEach, describe, expect, it } from 'vitest'
import { loadCoordinates, saveCoordinates } from './preferences'

function createMemoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key)
    },
    setItem: (key: string, value: string) => {
      data.set(key, String(value))
    },
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  })
})

describe('saveCoordinates / loadCoordinates', () => {
  it('保存后读取，完整还原四个坐标', () => {
    saveCoordinates({ mortarX: '73.73', mortarY: '64.32', targetX: '75.75', targetY: '59.59' })

    expect(loadCoordinates()).toEqual({
      mortarX: '73.73',
      mortarY: '64.32',
      targetX: '75.75',
      targetY: '59.59',
    })
  })

  it('存储为空时返回空对象', () => {
    expect(loadCoordinates()).toEqual({})
  })

  it('四个坐标全部为空时移除存储项', () => {
    saveCoordinates({ mortarX: '73.73', mortarY: '64.32', targetX: '75.75', targetY: '59.59' })
    saveCoordinates({ mortarX: '', mortarY: '', targetX: '', targetY: '' })

    expect(localStorage.getItem('wardogs:mortar:coordinates')).toBeNull()
    expect(loadCoordinates()).toEqual({})
  })

  it('仅含空白字符的坐标视为空，不保留草稿', () => {
    saveCoordinates({ mortarX: '  ', mortarY: '', targetX: '', targetY: '' })

    expect(localStorage.getItem('wardogs:mortar:coordinates')).toBeNull()
  })

  it('损坏的 JSON 返回空对象', () => {
    localStorage.setItem('wardogs:mortar:coordinates', '{oops')

    expect(loadCoordinates()).toEqual({})
  })

  it('存储内容不是对象时返回空对象', () => {
    localStorage.setItem('wardogs:mortar:coordinates', '"73.73"')

    expect(loadCoordinates()).toEqual({})
  })

  it('非字符串字段被过滤，其余字段保留', () => {
    localStorage.setItem(
      'wardogs:mortar:coordinates',
      JSON.stringify({ mortarX: 73.73, mortarY: '64.32', extra: 'ignored' }),
    )

    expect(loadCoordinates()).toEqual({ mortarY: '64.32' })
  })

  it('存储不可用时静默降级，不抛异常', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('denied')
        },
        setItem: () => {
          throw new Error('denied')
        },
        removeItem: () => {
          throw new Error('denied')
        },
      },
      configurable: true,
      writable: true,
    })

    expect(loadCoordinates()).toEqual({})
    expect(() =>
      saveCoordinates({ mortarX: '1', mortarY: '2', targetX: '3', targetY: '4' }),
    ).not.toThrow()
  })
})
