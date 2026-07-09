# detective-engine-web

AI 推理侦探游戏前端 — React + Vite + Tailwind + Zustand + EdgeOne Pages。

## CloudBase 登录

```env
VITE_TCB_ENV_ID=your-env-id
VITE_TCB_REGION=ap-shanghai
```

后端需配置对应的 `TCB_*` 变量以验证 `accessToken`。支持用户名密码登录 / 注册。

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

生产环境通过 `middleware.js` 将同源 `/api` 反代到腾讯云 SCF，无需跨域：

```env
VITE_API_BASE=/api
```

若 SCF 触发器 URL 变更，请同步修改 `middleware.js` 中的 `API_ORIGIN`，然后重新构建并部署。

