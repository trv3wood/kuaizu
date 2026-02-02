# Repository Guidelines

## Project Structure & Module Organization
- `miniprogram/`: WeChat Mini Program source (TypeScript + WXML/WXSS).
  - `miniprogram/app.ts`, `miniprogram/app.json`, `miniprogram/app.wxss`: app entry and global config/styles.
  - `miniprogram/pages/<page>/`: page modules; keep each page’s `*.ts`, `*.wxml`, `*.wxss`, `*.json` together.
  - `miniprogram/utils/`: shared utilities (e.g. `miniprogram/utils/util.ts`).
- `miniprogram_npm/`: generated NPM bundle output from WeChat DevTools (do not edit manually).
- `typings/`: custom type roots used by `tsconfig.json`.
- `project.config.json` / `project.private.config.json`: DevTools project settings (private file is per-developer).

## Build, Test, and Development Commands
- `npm ci` (or `npm install`): install dependencies used by the Mini Program (e.g. Vant Weapp, MobX).
- `npx tsc -p tsconfig.json --noEmit`: run a fast TypeScript type-check locally.
- WeChat DevTools:
  - Open the repo root; `miniprogramRoot` is `miniprogram/`.
  - Use “Tools → Build NPM” to regenerate `miniprogram_npm/` after dependency changes.
  - Use the simulator to validate page navigation and UI changes.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (matches `project.config.json` editor settings).
- Prefer existing conventions: no semicolons, single quotes in TS, and `Page({ data, methods })` or `Component({ data, methods })`.
- Page naming: `miniprogram/pages/<name>/<name>.ts` (+ matching `.wxml/.wxss/.json`).

## 开发进度 & 页面清单

### 已实现的页面
- `pages/home`: 首页 - 项目库列表。
- `pages/talent`: 人才大厅 - 人才库列表。
- `pages/publish`: **服务页** (原发布页) - 包含订单入口、认证入口、人才名片入口。
- `pages/profile`: 个人中心 - 用户信息、编辑资料入口、通用设置。
- `pages/login`: 登录页 - 微信一键登录/注册。
- `pages/edit-profile`: 编辑资料 - 修改头像、昵称、学校、专业、年级等。
- `pages/my-orders`: 我的订单 - 订单列表、状态筛选、微信支付集成。
- `pages/talent-card`: 人才名片 - 个人技能标签、MBTI、项目经历等的 CRUD。

### 核心模块
- **API 层** (`miniprogram/api/`):
  - `schema.d.ts`: 由 OpenAPI 自动生成的类型定义。
  - `index.ts`: 封装的业务 API 方法，严格对照后端接口。
- **状态管理** (`miniprogram/stores/`):
  - `userStore.ts`: 使用 MobX 管理全局用户信息、登录状态和认证状态。
- **网络请求** (`miniprogram/utils/http.ts`):
  - 基于 `miniprogram-request` 封装，支持拦截器、Token 自动注入、401 自动跳转登录。

## shell
using Powershell

## 当前测试配置
- 默认 BaseURL: `http://127.0.0.1:8080/api/v2`
- 登录逻辑: `authApi.loginWithWechat` 调用后端完成 JWT 颁发。

## 依赖
```json
{
  "dependencies": {
    "@vant/weapp": "^1.11.7",
    "miniprogram-request": "^5.3.0",
    "mobx-miniprogram": "^6.12.3",
    "mobx-miniprogram-bindings": "^5.1.1"
  },
  "devDependencies": {
    "miniprogram-api-typings": "^4.1.3",
    "openapi-typescript": "^7.10.1",
    "typescript": "^5.9.3"
  }
}
```