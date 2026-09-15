# WarDogs 工具

面向 WarDogs（战狗）玩家的游戏工具站，兼容手机、平板与桌面端。当前提供：

- **迫击炮计算器**（`/mortar`）：输入迫击炮与目标的游戏内坐标，计算两点直线距离和从迫击炮指向目标的方位角（正北 0°，顺时针递增）。计算全部在浏览器本地完成。

线上地址：https://wardogs.campone.cc（工具列表在 `/`，计算器在 `/mortar`）。

## 技术栈

- TypeScript（严格模式）+ React + Vite
- Cloudflare Workers Static Assets 托管构建产物（SPA 回退到 `index.html`）
- Vitest 单元测试、Playwright 端到端测试、Wrangler 部署
- pnpm 作为唯一包管理器（版本见 `package.json` 的 `packageManager` 字段，Node.js 版本见 `.nvmrc`）

## 目录结构

```text
src/
  app/                  # 应用入口、路由与页面布局
  components/           # 跨工具复用的界面组件（按需创建）
  tools/mortar/         # 迫击炮工具：界面、坐标适配与纯计算逻辑
    lib/                #   纯计算与校验（geometry / coordinates / calculate / format）
    components/         #   工具界面组件
  lib/                  # 确有跨模块用途的公共逻辑（按需创建）
public/                 # 随站点发布的静态资源
tests/                  # Playwright 端到端测试
.github/workflows/      # CI 与部署流程
wrangler.jsonc          # Workers 配置
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | Vite 本地开发服务器（热更新） |
| `pnpm build` | 类型检查 + 生产构建，输出到 `dist/` |
| `pnpm lint` | ESLint 检查 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm test` | Vitest 单元测试 |
| `pnpm test:e2e` | Playwright 端到端测试（先构建再用 `vite preview` 启动） |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm cf:preview` | 通过 `wrangler dev` 以 Workers 运行环境预览（需先 `pnpm build`） |
| `pnpm deploy:staging` | 构建并部署到 staging（`wardogs-tools-staging`） |
| `pnpm deploy:production` | 构建并部署到生产（`wardogs-tools`） |

首次运行端到端测试前需要安装浏览器：`pnpm exec playwright install chromium`。

## 游戏数据核实状态

以下参数来自**社区校准与开源实现**，官方（BULKHEAD）从未公布，可能随版本变化。最近核查日期：2026-09-14（适用 Beta 2 至抢先体验初期）：

- **地图比例尺**：1 坐标单位 = 100 米。Bakurani 与 Ozeti 地图为 16×16 km，坐标范围 0–160、显示两位小数（0.01 = 1 米）。依据：[ExpCarry 射表攻略](https://expcarry.com/wardogs-artillery-mortar-range-elevation-formula)的演算示例（坐标差 5 单位 = 500 米）与开源计算器 [djzet/wardogs-calc](https://github.com/djzet/wardogs-calc) 的实现（`gameToMeters` 默认 ×100、地图尺寸 16000 米）互相一致。
- **坐标轴与方位角**：X 向东为正、Y 向北递增；方位角正北 0°、顺时针递增。依据：同一开源实现中屏幕坐标为游戏 Y 取负（Y 轴向上为北），方位角按 `atan2(dx, dy)` 计算。
- **坐标范围校验**：上限 ±1,000,000 仅为防止误输入的宽松边界，不是游戏数据。
- **游戏内网格**：社区实测小格约 100 米；大格存在 1 千米与 2 千米两种说法，来源不一致，未采用。
- **版本风险提示**：[WARDOGS Wiki 迫击炮攻略](https://www.wardogswiki.com/zh-cn/guides/wardogs-mortar-guide)明确指出网格与单位是版本相关的玩家实测，重大更新后应先用游戏内已知距离重新验证。

仰角、密位、装药与射程提示仍未实现。社区射表（如 L81 迫击炮 110–700 m）已获得公开来源，但属于版本相关数据，待确认当前抢先体验版本适用性后再加入。

## 部署

### 环境

- staging：`main` 分支通过全部检查后自动部署（Worker 名称 `wardogs-tools-staging`）。
- production：推送 `vX.Y.Z` 标签触发（Worker 名称 `wardogs-tools`）。流水线会校验标签与 `package.json` 版本一致、标签提交已进入 `main`，部署后执行冒烟检查并生成 GitHub Release 发布说明。同一环境的部署串行执行。

### 本地一键部署

```bash
scripts/deploy.sh              # 部署到 staging（默认）
scripts/deploy.sh production   # 部署到生产
```

脚本依次执行依赖安装、lint、类型检查、单元测试、构建与 `wrangler deploy`（端到端测试由 CI 负责）。前置条件（满足其一）：

1. 在交互终端执行过 `pnpm exec wrangler login` 完成 OAuth 授权；或
2. 设置了环境变量 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`。

### 一次性配置

1. 在 GitHub 仓库 Secrets 中配置：
   - `CLOUDFLARE_API_TOKEN`：最小权限的 API Token（仅需对应 Workers 的编辑权限）。
   - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账户 ID。
2. 确认 Actions 权限允许 `contents: write`（用于生成 Release）。
3. 凭据不得提交到仓库；本地开发如需密钥，使用 `.dev.vars`（已在 `.gitignore` 中忽略）。

### 回滚说明

应用回滚（重新部署旧版本）与数据回滚是两回事：本项目当前只托管静态资源，重新部署旧标签即可完成应用回滚；若未来引入 D1 等存储，应用回滚**不会**自动回滚数据库，需要单独的数据恢复方案与兼容的迁移策略。

## 测试约定

- 计算逻辑的单元测试与模块同目录（`*.test.ts`），覆盖正北/东/南/西、四象限、同点、轴翻转、比例尺换算、角度归一化与非法输入。
- 端到端测试在 `tests/` 下，同时跑桌面与移动端视口。
