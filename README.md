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

生产环境前端**直连** CloudBase 云托管 API，无需 EdgeOne 反代：

```env
# .env.production
VITE_API_BASE=https://<云托管默认域名>/api
```

云托管默认域名在 API 仓库 Actions 部署日志或 [云托管控制台](https://console.cloud.tencent.com/tcb/env/cloudrun) 查看，形如：

`https://detective-engine-api-xxxxx.ap-shanghai.run.tcloudbase.com`

修改 `.env.production` 后执行 `npm run build:app`，提交 `dist/` 再推送。

`middleware.js` 仍保留用于本地或 EdgeOne 反代场景，当前生产不依赖。
