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

GitHub Push → EdgeOne Pages 构建 `npm run build`，`/api/*` 转发至 Cloud Functions。
