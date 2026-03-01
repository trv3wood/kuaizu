# kuaizu

快租微信小程序前端项目（TypeScript + WXML/WXSS）。

## 文档
- API 文档: https://trv3wood.github.io/kuaizu-server

## 目录结构
- `miniprogram/`: 小程序源码
- `miniprogram/pages/`: 页面模块
- `miniprogram/utils/`: 公共工具
- `miniprogram/stores/`: MobX 状态管理
- `miniprogram/api/`: 业务 API 封装
- `typings/`: 自定义类型

## 开发
1. 安装依赖
   - `npm`
2. 类型检查
   - `npx tsc -p tsconfig.json --noEmit`
3. WeChat DevTools
   - 打开项目根目录
   - `miniprogramRoot` 为 `miniprogram/`
   - 依赖变更后执行 “Tools → Build NPM”
4. 生成 OpenAPI 类型定义
   - 下载API文档，放在 `miniprogram/service.yaml`
   ```shell
   cd miniprogram
   wget https://trv3wood.github.io/kuaizu-server/service.yaml
   ```
   - 运行代码生成脚本
   ```shell
   npm run generate
   ```
