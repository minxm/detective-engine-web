# detective-engine-web

AI 推理侦探游戏前端 — React + Vite + Tailwind + Zustand + EdgeOne Pages。

## CloudBase 登录

```env
VITE_TCB_ENV_ID=your-env-id
VITE_TCB_REGION=ap-shanghai
```

后端需配置对应的 `TCB_*` 变量以验证 `accessToken`。支持：

- CloudBase 匿名登录
- 用户名密码登录 / 注册
- 访客模式（降级）

## 目录

```
src/
  components/    UI + AuthProvider + AuthModal
  pages/         页面路由
  hooks/         Zustand auth store
  lib/           CloudBase JS SDK 封装
  services/      API 层（/api/*）
```

## 本地开发

```bash
cp .env.example .env
npm install

# 终端 1
cd ../detective-engine-api && npm run dev

# 终端 2
npm run dev
```

## 部署

GitHub Push → EdgeOne Pages 托管 `dist/`（本地 `npm run build:app` 预构建）。

生产 API 地址在 `.env.production` 中配置：

```env
VITE_API_BASE=https://1450903261-2c7ic9hgxq.ap-shanghai.tencentscf.com/api
```

修改 SCF 触发器 URL 后需重新执行 `npm run build:app` 并提交 `dist/`。
```
npm run build:app
git add -A
git commit -m "..."
git push
```
