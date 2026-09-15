#!/usr/bin/env bash
# WarDogs 工具一键部署脚本
#
# 用法：
#   scripts/deploy.sh              # 部署到 staging（默认）
#   scripts/deploy.sh staging      # 同上
#   scripts/deploy.sh production   # 部署到生产
#
# 前置条件（满足其一即可）：
#   1. 已在交互终端执行过 `pnpm exec wrangler login`（OAuth 登录）；
#   2. 或设置了环境变量 CLOUDFLARE_API_TOKEN 与 CLOUDFLARE_ACCOUNT_ID。
#
# 说明：脚本会执行 lint、类型检查、单元测试和生产构建；
# 端到端测试与发布说明由 CI 流水线负责（见 .github/workflows/）。
set -euo pipefail

ENV="${1:-staging}"

case "$ENV" in
  staging | production) ;;
  *)
    echo "用法：$0 [staging|production]" >&2
    exit 1
    ;;
esac

echo "==> 检查工具链"
command -v node >/dev/null 2>&1 || { echo "错误：未找到 node，请先安装（见 .nvmrc）" >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "错误：未找到 pnpm" >&2; exit 1; }

echo "==> 检查 Cloudflare 登录状态"
if ! pnpm exec wrangler whoami >/dev/null 2>&1; then
  echo "错误：Wrangler 未登录。" >&2
  echo "  方式一：在交互终端运行 pnpm exec wrangler login 完成浏览器授权" >&2
  echo "  方式二：设置 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID 环境变量" >&2
  exit 1
fi

echo "==> 安装依赖（冻结锁文件）"
pnpm install --frozen-lockfile

echo "==> Lint"
pnpm run lint

echo "==> 类型检查"
pnpm run typecheck

echo "==> 单元测试"
pnpm run test

echo "==> 生产构建"
pnpm run build

if [ "$ENV" = "staging" ]; then
  echo "==> 部署到 staging（wardogs-tools-staging）"
  pnpm exec wrangler deploy --env staging
else
  echo "==> 部署到 production（wardogs-tools）"
  pnpm exec wrangler deploy --env=""
fi

echo "==> 完成"
