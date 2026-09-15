import { expect, test } from '@playwright/test'

test('首页展示工具列表，并可进入迫击炮计算器', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'WarDogs 工具', level: 1 })).toBeVisible()
  await page.getByRole('link', { name: /迫击炮计算器/ }).click()
  await expect(page).toHaveURL(/\/mortar$/)
  await expect(page.getByRole('heading', { name: '迫击炮计算器', level: 1 })).toBeVisible()
})

test('深链接可直接打开计算器（SPA 路由）', async ({ page }) => {
  await page.goto('/mortar')
  await expect(page.getByRole('heading', { name: '迫击炮计算器', level: 1 })).toBeVisible()
})

test('输入坐标计算出距离与方位角', async ({ page }) => {
  await page.goto('/mortar')
  await page.getByLabel('迫击炮 X 坐标').fill('0')
  await page.getByLabel('迫击炮 Y 坐标').fill('0')
  await page.getByLabel('目标 X 坐标').fill('3')
  await page.getByLabel('目标 Y 坐标').fill('4')
  await page.getByRole('button', { name: '计算' }).click()

  const result = page.getByRole('region', { name: '计算结果' })
  await expect(result).toContainText('500.0 米')
  await expect(result).toContainText('36.9°')
  await expect(result).toContainText('东北方向')
  await expect(result).toContainText('按 100 米/坐标单位换算')
})

test('两点重合时提示方位无定义', async ({ page }) => {
  await page.goto('/mortar')
  await page.getByLabel('迫击炮 X 坐标').fill('10')
  await page.getByLabel('迫击炮 Y 坐标').fill('10')
  await page.getByLabel('目标 X 坐标').fill('10')
  await page.getByLabel('目标 Y 坐标').fill('10')
  await page.getByRole('button', { name: '计算' }).click()

  const result = page.getByRole('region', { name: '计算结果' })
  await expect(result).toContainText('0.0 米')
  await expect(result).toContainText('两点重合，方位无定义')
})

test('非法输入显示错误提示且不产生结果', async ({ page }) => {
  await page.goto('/mortar')
  await page.getByLabel('迫击炮 Y 坐标').fill('abc')
  await page.getByRole('button', { name: '计算' }).click()

  await expect(page.getByText('请输入坐标')).toHaveCount(3)
  await expect(page.getByText('坐标必须是数字')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(4)
  await expect(page.getByRole('region', { name: '计算结果' })).toHaveCount(0)
})

test('重置清空坐标输入与结果', async ({ page }) => {
  await page.goto('/mortar')
  await page.getByLabel('迫击炮 X 坐标').fill('1')
  await page.getByLabel('目标 X 坐标').fill('2')
  await page.getByRole('button', { name: '重置' }).click()

  await expect(page.getByLabel('迫击炮 X 坐标')).toHaveValue('')
  await expect(page.getByLabel('目标 X 坐标')).toHaveValue('')
  await expect(page.getByRole('region', { name: '计算结果' })).toHaveCount(0)
})

test('未修改设置时点击计算不写入本地偏好', async ({ page }) => {
  await page.goto('/mortar')
  await page.getByLabel('迫击炮 X 坐标').fill('0')
  await page.getByLabel('迫击炮 Y 坐标').fill('0')
  await page.getByLabel('目标 X 坐标').fill('3')
  await page.getByLabel('目标 Y 坐标').fill('4')
  await page.getByRole('button', { name: '计算' }).click()

  const storedScale = await page.evaluate(() =>
    localStorage.getItem('wardogs:mortar:metersPerUnit'),
  )
  expect(storedScale).toBeNull()
})

test('修改比例尺后保存，刷新页面仍然保留', async ({ page }) => {
  await page.goto('/mortar')
  await page.getByText('坐标与比例尺设置').click()
  await page.getByLabel('比例尺（米/坐标单位）').fill('50')
  await page.getByLabel('迫击炮 X 坐标').fill('0')
  await page.getByLabel('迫击炮 Y 坐标').fill('0')
  await page.getByLabel('目标 X 坐标').fill('3')
  await page.getByLabel('目标 Y 坐标').fill('4')
  await page.getByRole('button', { name: '计算' }).click()

  const result = page.getByRole('region', { name: '计算结果' })
  await expect(result).toContainText('250.0 米')
  await expect(result).toContainText('按 50 米/坐标单位换算')

  await page.reload()
  await page.getByText('坐标与比例尺设置').click()
  await expect(page.getByLabel('比例尺（米/坐标单位）')).toHaveValue('50')
})

test('旧版本遗留的本地偏好生效时在结果中明确可见', async ({ page }) => {
  await page.goto('/mortar')
  // 模拟旧版本（默认比例尺为 1 时）写入的本地偏好
  await page.evaluate(() => {
    localStorage.setItem('wardogs:mortar:metersPerUnit', '1')
    localStorage.setItem('wardogs:mortar:yAxisDirection', 'up')
  })
  await page.reload()

  await page.getByLabel('迫击炮 X 坐标').fill('0')
  await page.getByLabel('迫击炮 Y 坐标').fill('0')
  await page.getByLabel('目标 X 坐标').fill('3')
  await page.getByLabel('目标 Y 坐标').fill('4')
  await page.getByRole('button', { name: '计算' }).click()

  const result = page.getByRole('region', { name: '计算结果' })
  await expect(result).toContainText('5.0 米')
  await expect(result).toContainText('按 1 米/坐标单位换算')
})
