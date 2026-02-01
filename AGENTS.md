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
- Prefer existing conventions: no semicolons, single quotes in TS, and `Component({ data, methods })` for pages/components.
- Page naming: `miniprogram/pages/<name>/<name>.ts` (+ matching `.wxml/.wxss/.json`).

## Testing Guidelines
- No automated test runner is configured in this repo.
- Before opening a PR: run `npx tsc -p tsconfig.json --noEmit` and smoke-test in WeChat DevTools (simulator + real device if UI/permissions change).

## Security & Configuration Tips
- Treat `project.private.config.json` as developer-local; avoid committing machine-specific paths or credentials.
- Do not hardcode secrets in `miniprogram/`; prefer server-side config and Mini Program secure storage patterns.
