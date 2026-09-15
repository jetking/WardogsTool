/**
 * 工具清单：后续新增工具时在此登记，首页（/）会自动列出。
 */
export interface ToolMeta {
  path: string
  name: string
  description: string
}

export const tools: ToolMeta[] = [
  {
    path: '/mortar',
    name: '迫击炮计算器',
    description: '输入迫击炮与目标的游戏内坐标，计算两点距离和射击方位角。',
  },
]
