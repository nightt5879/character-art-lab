# Character Art Lab

面向游戏开发的开源角色立绘资产生成工作流。

它不是普通文生图网页，而是帮助独立游戏、视觉小说、RPG 项目管理角色卡、生成候选立绘、审查结果、导出 PNG + manifest，并为 Godot / Unity 导入做准备。

## 当前状态

Alpha / 协议 MVP。

当前版本重点：

- 角色卡协议
- Prompt Builder
- Provider 抽象
- MockProvider
- DashScope Qwen Provider，本地 CLI 使用
- CLI `validate` 与 `render`
- PNG + image manifest 输出
- Web Studio：角色卡编辑、prompt 预览、mock 生成、JSON 导出

## 快速开始

```bash
npm install
npm run dev
```

运行 mock CLI：

```bash
npm run cal -- validate --character examples/character-cards/fox-merchant.json

npm run cal -- render \
  --character examples/character-cards/fox-merchant.json \
  --provider mock \
  --model mock-image \
  --size 1104*1472 \
  --n 4 \
  --out-dir out/fox-merchant
```

配置 DashScope Qwen 后运行真实生成：

```powershell
$env:DASHSCOPE_API_KEY="sk-your-key"
$env:DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com"

npm run cal -- render `
  --character examples/character-cards/fox-merchant.json `
  --provider dashscope-qwen `
  --model qwen-image-2.0-pro `
  --size 1104*1472 `
  --n 1 `
  --out-dir out/fox-merchant-qwen
```

北京 endpoint 是 `https://dashscope.aliyuncs.com`，新加坡 endpoint 是 `https://dashscope-intl.aliyuncs.com`。不同地域的 API Key 和 endpoint 不能混用。

## 安全边界

不要把 API Key 放进前端代码。不要提交 `.env` 文件。

公开 demo 只能使用 `MockProvider`。真实 provider 调用只能发生在本地 CLI 或用户自己控制的后端中。

## 授权说明

项目代码计划使用 Apache-2.0。生成图片不由本仓库授予统一授权，具体使用权取决于用户输入素材、所选 provider、所选模型以及对应条款。
