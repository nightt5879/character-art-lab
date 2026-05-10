# `character-art-lab` 开源项目开发计划书

> 面向本地 AI 编程助手的完整执行文档。  
> 目标：把项目做成一个类似 `mumble-voice-lab` 的通用开源工具，但领域从“游戏语音资产”切换到“游戏角色立绘资产”。

---

## 0. 项目命名

### 推荐仓库名

```text
character-art-lab
```

### 可选备选名

```text
portrait-art-lab
sprite-portrait-lab
standing-art-lab
game-portrait-lab
character-portrait-lab
```

### 当前默认

本文后续统一使用：

```text
character-art-lab
```

### 命名原则

- 不使用特定项目名、世界观名或品牌名。
- 名字要像 `mumble-voice-lab` 一样通用、清晰、可开源传播。
- 项目定位是“游戏角色立绘资产工作流”，不是“某个模型的 Web UI”。

---

## 1. 项目一句话定位

`character-art-lab` 是一个面向独立游戏、视觉小说、RPG 和对话系统的开源角色立绘生成与导出工作流。

它帮助开发者从结构化角色卡生成候选立绘，审查结果，制作表情/服装/姿势差分，导出 PNG 与 metadata manifest，并为 Unity / Godot 导入做准备。

---

## 2. 项目不是什么

本项目不要做成普通“文生图玩具”。

### 非目标

- 不做游戏运行时实时生成。
- 不做公开 API 代理服务。
- 不在 GitHub Pages 或前端代码中暴露用户 API Key。
- 不把模型权重打包进仓库。
- 不承诺所有生成图天然可商用。
- 不做完整 Photoshop 式图像编辑器。
- 不在 v0.1 就做 LoRA 训练平台。
- 不把某个闭源 API 的能力写死成核心依赖。

### 正确边界

```text
编辑器阶段生成资产
        ↓
人工审查 / 自动质检
        ↓
导出 PNG + manifest
        ↓
游戏运行时只消费已生成资产
```

这和 `mumble-voice-lab` 的思路一致：工具负责编辑期资产生成，游戏运行时只播放/展示已经生成好的资产。

---

## 3. 为什么这个项目值得做

普通文生图 UI 的价值有限。真正适合游戏开发的开源项目应该提供：

1. **角色卡协议**  
   用结构化 JSON 固定角色身份、外观、服装、风格、禁忌项。

2. **Provider 抽象**  
   当前可调用云端 API，后期可迁移到本地部署模型。

3. **资产协议**  
   每张图片都记录 prompt、模型、参数、seed、来源、审查状态、文件路径和角色 ID。

4. **CLI 批量生成**  
   能给游戏项目批量生成 NPC、表情差分、服装差分。

5. **本地 Runner**  
   后期可以用 Qwen-Image / Z-Image 等开源模型自部署，不被 API 绑定。

6. **Unity / Godot 导入**  
   把生成结果变成游戏项目真正能用的资产包。

---

## 4. 技术底座选择

### 主线选择

```text
主线模型生态：Qwen-Image / Z-Image
主线云端 API：Alibaba Cloud Model Studio / DashScope Qwen Image
长期本地部署：Local Qwen-Image / Local Z-Image / ComfyUI Runner
```

### 选择理由

- Qwen-Image / Z-Image 方向适合“先 API、后自部署”的策略。
- Provider 层从第一天抽象，避免业务逻辑绑定单一 API。
- Z-Image 适合做轻量草稿、NPC 批量图、低成本本地测试。
- Qwen-Image / Qwen-Image-Edit 更适合高质量生成、图像编辑和差分。

### 重要原则

即便第一版只接一个云端 API，也要把代码写成：

```text
业务任务
  ↓
Provider 接口
  ↓
DashScope / Local Runner / Custom HTTP / ComfyUI
```

不要写成：

```text
业务任务
  ↓
直接调用某一家 API
```

---

## 5. 核心工作流

```text
Character Card
  ↓
Prompt Builder
  ↓
Generation Task
  ↓
Image Provider
  ↓
Generated PNG
  ↓
Image Asset Manifest
  ↓
Review / Accept / Reject
  ↓
Portrait Set Export
  ↓
Unity / Godot Import
```

### 详细流程

1. 用户创建角色卡。
2. 用户选择任务类型：基础立绘、半身像、表情差分、服装差分、姿势差分等。
3. Prompt Builder 将角色卡和任务类型转换成 prompt。
4. Provider 执行生成或编辑。
5. 工具保存 PNG、缩略图和 metadata。
6. 用户在 Gallery 里审查候选图。
7. 用户选择主视觉或差分图。
8. 工具导出 portrait set。
9. 游戏引擎插件读取 manifest，生成可用资源。

---

## 6. 推荐技术栈

### 前端

```text
Vite
React
TypeScript
CSS Modules 或 Tailwind
```

### CLI / Node 侧

```text
TypeScript
Node.js 20+
tsx 或 ts-node
commander / yargs
zod
```

### 本地 Runner

```text
Python 3.10+
FastAPI 或 subprocess JSON 协议
PyTorch
Diffusers / ComfyUI / upstream runner
```

### 数据格式

```text
JSON
JSON Schema
PNG
WebP thumbnail，可选
ZIP export pack
```

### 不建议第一版引入

```text
Electron
Tauri
数据库
账号系统
云端托管
多用户协作
复杂权限系统
```

---

## 7. 推荐仓库结构

```text
character-art-lab/
  README.md
  README.zh-CN.md
  CHANGELOG.md
  LICENSE
  NOTICE
  THIRD_PARTY_NOTICES.md
  MODEL_LICENSES.md
  GENERATED_OUTPUT_POLICY.md
  package.json
  tsconfig.json
  vite.config.ts

  src/
    app/
      App.tsx
      routes/
      components/
      studio/
      gallery/
      settings/

    core/
      schemas/
        character-card.ts
        generation-task.ts
        image-asset.ts
        portrait-set.ts
        provider.ts
        batch.ts

      prompt/
        prompt-builder.ts
        style-presets.ts
        negative-presets.ts
        composition-presets.ts
        character-card-to-prompt.ts

      providers/
        index.ts
        mock-provider.ts
        dashscope-qwen-provider.ts
        local-qwen-provider.ts
        local-zimage-provider.ts
        comfyui-provider.ts
        provider-capabilities.ts
        provider-errors.ts

      pipeline/
        generate-character.ts
        generate-variant.ts
        edit-image.ts
        batch-runner.ts
        postprocess.ts
        review.ts

      assets/
        save-image.ts
        save-manifest.ts
        make-thumbnail.ts
        hash.ts
        export-pack.ts

      eval/
        checklist.ts
        scoring.ts

  scripts/
    cal.ts
    test-cli.ts
    generate-readme-samples.ts
    prepare-godot-assetlib.ts
    build-local-runner.ts

  local-runners/
    qwen-image/
      runner.py
      requirements.txt
      README.md
    z-image/
      runner.py
      requirements.txt
      README.md
    comfyui/
      workflows/
        qwen-image.json
        z-image-turbo.json

  integrations/
    unity/
      com.example.character-art-lab/
    godot/
      addons/
        character_art_lab/

  docs/
    quick-start.md
    integrations.md
    provider-api.md
    asset-schema.md
    local-deployment.md
    prompt-guide.md
    character-card-guide.md
    release-qa.md
    licensing.md
    api-key-security.md

  examples/
    character-cards/
      fox-merchant.json
      robot-guard.json
      village-healer.json
    batches/
      cozy-town-npcs.json
    prompts/
    outputs/
      .gitkeep

  public/
    samples/
    icons/

  .github/
    workflows/
      pages.yml
      ci.yml
```

---

## 8. 核心 Schema 设计

### 8.1 Character Card

文件：`src/core/schemas/character-card.ts`

示例 JSON：

```json
{
  "schema": "character-art-lab/character-card",
  "schemaVersion": "0.1",
  "id": "fox-merchant",
  "name": "Fox Merchant",
  "role": "traveling merchant NPC",
  "world": "cozy fantasy town",
  "visual": {
    "genderPresentation": "female",
    "ageRange": "young adult",
    "bodyType": "slender",
    "hair": "long amber hair, soft curls",
    "eyes": "golden fox-like eyes",
    "signatureFeatures": [
      "fox ears",
      "small fang",
      "red ribbon",
      "merchant satchel"
    ],
    "palette": [
      "warm amber",
      "cream white",
      "muted red"
    ]
  },
  "outfit": {
    "base": "cozy fantasy merchant outfit",
    "materials": ["linen", "leather", "wool"],
    "accessories": ["coin pouch", "small ledger"]
  },
  "style": {
    "renderStyle": "anime game character standing illustration",
    "lineStyle": "clean line art",
    "lighting": "soft studio lighting",
    "background": "plain light background"
  },
  "constraints": {
    "mustInclude": [
      "full body",
      "front-facing",
      "feet visible",
      "clean silhouette"
    ],
    "avoid": [
      "extra fingers",
      "cropped feet",
      "busy background",
      "text",
      "watermark"
    ]
  }
}
```

TypeScript 类型草案：

```ts
export interface CharacterCard {
  schema: "character-art-lab/character-card";
  schemaVersion: string;
  id: string;
  name: string;
  role?: string;
  world?: string;
  visual: {
    genderPresentation?: string;
    ageRange?: string;
    bodyType?: string;
    hair?: string;
    eyes?: string;
    signatureFeatures?: string[];
    palette?: string[];
  };
  outfit?: {
    base?: string;
    materials?: string[];
    accessories?: string[];
  };
  style?: {
    renderStyle?: string;
    lineStyle?: string;
    lighting?: string;
    background?: string;
  };
  constraints?: {
    mustInclude?: string[];
    avoid?: string[];
  };
}
```

---

### 8.2 Generation Task

文件：`src/core/schemas/generation-task.ts`

示例 JSON：

```json
{
  "schema": "character-art-lab/generation-task",
  "schemaVersion": "0.1",
  "id": "fox-merchant-base-standing",
  "characterId": "fox-merchant",
  "taskType": "base-standing",
  "provider": "dashscope-qwen",
  "model": "qwen-image-2.0-pro",
  "size": "1104*1472",
  "n": 4,
  "seed": 42,
  "promptMode": "structured",
  "promptExtend": false,
  "watermark": false,
  "output": {
    "format": "png",
    "saveMetadata": true,
    "makeThumbnail": true
  }
}
```

Task Type 建议：

```text
base-standing
half-body
bust
expression-variant
costume-variant
pose-variant
reference-sheet
npc-pack
```

---

### 8.3 Image Asset Manifest

文件：`src/core/schemas/image-asset.ts`

示例 JSON：

```json
{
  "schema": "character-art-lab/image-asset",
  "schemaVersion": "0.1",
  "assetId": "fox-merchant-base-standing-0001",
  "characterId": "fox-merchant",
  "taskId": "fox-merchant-base-standing",
  "createdAt": "2026-05-10T00:00:00.000Z",
  "generator": {
    "provider": "dashscope-qwen",
    "model": "qwen-image-2.0-pro",
    "modelVersion": "unknown",
    "runnerVersion": "0.1.0"
  },
  "files": {
    "image": "fox-merchant-base-standing-0001.png",
    "thumbnail": "fox-merchant-base-standing-0001.thumb.png"
  },
  "prompt": {
    "positive": "full-body standing character illustration of ...",
    "negative": "low quality, extra fingers, cropped feet...",
    "rawCharacterCard": "character-cards/fox-merchant.json"
  },
  "parameters": {
    "size": "1104*1472",
    "seed": 42,
    "promptExtend": false,
    "watermark": false
  },
  "source": {
    "baseImageHash": null,
    "referenceImages": []
  },
  "review": {
    "status": "pending",
    "scores": {
      "characterConsistency": null,
      "gameUsability": null,
      "hands": null,
      "silhouette": null,
      "outfitAccuracy": null
    },
    "notes": []
  }
}
```

Review 状态：

```text
pending
accepted
rejected
needs_edit
archived
```

---

### 8.4 Portrait Set

用于 Unity / Godot 导入。

文件：`src/core/schemas/portrait-set.ts`

```json
{
  "schema": "character-art-lab/portrait-set",
  "schemaVersion": "0.1",
  "id": "fox-merchant-portrait-set",
  "characterId": "fox-merchant",
  "displayName": "Fox Merchant",
  "base": {
    "assetId": "fox-merchant-base-standing-0001",
    "image": "base/fox-merchant-base-standing-0001.png"
  },
  "expressions": {
    "neutral": "expressions/neutral.png",
    "happy": "expressions/happy.png",
    "sad": "expressions/sad.png",
    "angry": "expressions/angry.png",
    "surprised": "expressions/surprised.png"
  },
  "costumes": {
    "default": "base/fox-merchant-base-standing-0001.png",
    "winter": "costumes/winter.png"
  },
  "metadata": {
    "createdAt": "2026-05-10T00:00:00.000Z",
    "sourceTool": "character-art-lab",
    "sourceVersion": "0.1.0"
  }
}
```

---

### 8.5 Batch File

文件：`src/core/schemas/batch.ts`

```json
{
  "schema": "character-art-lab/batch",
  "schemaVersion": "0.1",
  "id": "cozy-town-npcs",
  "defaults": {
    "provider": "dashscope-qwen",
    "model": "qwen-image-2.0-pro",
    "size": "1104*1472",
    "n": 4,
    "promptExtend": false,
    "watermark": false
  },
  "items": [
    {
      "id": "fox-merchant-base",
      "character": "examples/character-cards/fox-merchant.json",
      "taskType": "base-standing"
    },
    {
      "id": "robot-guard-base",
      "character": "examples/character-cards/robot-guard.json",
      "taskType": "base-standing"
    }
  ]
}
```

---

## 9. Provider 抽象

文件：`src/core/providers/provider-capabilities.ts`

```ts
export type ImageProviderKind =
  | "mock"
  | "dashscope-qwen"
  | "local-qwen"
  | "local-zimage"
  | "comfyui"
  | "custom-http";

export interface ImageProviderCapabilities {
  textToImage: boolean;
  imageToImage: boolean;
  imageEdit: boolean;
  multiReference: boolean;
  negativePrompt: boolean;
  seed: boolean;
  batch: boolean;
  maxImagesPerRequest: number;
  supportedSizes: string[];
}

export interface GenerateImageRequest {
  taskId: string;
  prompt: string;
  negativePrompt?: string;
  size: string;
  n: number;
  seed?: number;
  characterCard?: unknown;
  referenceImages?: string[];
  metadata?: Record<string, unknown>;
}

export interface GeneratedImage {
  id: string;
  imagePath: string;
  width?: number;
  height?: number;
  provider: string;
  model: string;
  seed?: number;
  rawResponse?: unknown;
}

export interface ImageProvider {
  id: ImageProviderKind;
  name: string;
  getCapabilities(): ImageProviderCapabilities;
  generate(request: GenerateImageRequest): Promise<GeneratedImage[]>;
  edit?(request: GenerateImageRequest): Promise<GeneratedImage[]>;
}
```

### 第一批 Provider

```text
MockProvider
DashScopeQwenProvider
LocalQwenProvider placeholder
LocalZImageProvider placeholder
```

### 第二批 Provider

```text
ComfyUIProvider
CustomHttpProvider
ZhipuProvider
BaiduProvider
StepFunProvider
```

第二批先做接口预留，不要在 v0.1 里硬接太多。

---

## 10. Provider 错误规范

文件：`src/core/providers/provider-errors.ts`

```ts
export type ProviderErrorKind =
  | "missing_api_key"
  | "rate_limited"
  | "content_policy"
  | "invalid_size"
  | "network_error"
  | "provider_error"
  | "local_runner_unavailable"
  | "file_write_error"
  | "unknown";

export interface NormalizedProviderError {
  kind: ProviderErrorKind;
  message: string;
  provider: string;
  model?: string;
  raw?: unknown;
}
```

### 错误处理要求

- 不把 provider 原始错误直接抛给 UI。
- CLI 输出可读错误。
- manifest 或 batch report 中记录失败原因。
- rate limit 错误支持重试。
- content policy 错误不自动无限重试。

---

## 11. API Key 安全设计

### 关键规则

- API Key 只允许从环境变量读取。
- `.env` 必须加入 `.gitignore`。
- `.env.example` 可以提交。
- GitHub Pages Demo 只能跑 MockProvider。
- 真实 API 调用只能发生在本地 Node CLI / 本地 Node server / 用户自托管后端。
- 前端禁止直接保存或显示完整 API Key。

### `.env.example`

```bash
DASHSCOPE_API_KEY=
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com
CAL_OUTPUT_DIR=out
CAL_PROVIDER=dashscope-qwen
```

### README 必须声明

```text
Do not put your API key in frontend code.
Do not commit .env files.
The hosted demo does not proxy generation requests.
Real provider calls should run locally or on your own trusted backend.
```

---

## 12. Prompt Builder

文件：`src/core/prompt/prompt-builder.ts`

### Prompt 构成

```text
Subject block
Game asset usage block
Composition block
Character identity block
Outfit block
Style block
Background block
Quality block
Negative block
```

### 基础立绘 Prompt 模板

```text
full-body standing character illustration of {name}, {role},
designed as a clean game dialogue portrait asset,
centered composition, front-facing, full body visible, feet visible,
clean silhouette, plain light background,
{visual_features},
{outfit_description},
{style_description},
soft studio lighting, clean line art, high-quality game character art
```

### Negative Prompt 模板

```text
low quality, blurry, extra fingers, missing fingers, extra limbs,
cropped feet, cropped head, busy background, text, watermark,
logo, duplicated character, distorted face, inconsistent eyes,
bad anatomy, malformed hands
```

### Prompt Builder 要求

- 输入 `CharacterCard` 和 `GenerationTask`。
- 输出 `positivePrompt` 和 `negativePrompt`。
- 不在 prompt 中包含用户 API Key 或敏感路径。
- 支持 `taskType` 定制：基础立绘、表情差分、服装差分等。
- 支持中文角色卡，但输出 prompt 可以默认英文，后续再加 bilingual mode。

---

## 13. CLI 设计

CLI 文件：`scripts/cal.ts`

命令名称暂定：

```bash
cal
```

也可以在 package.json 中注册：

```json
{
  "bin": {
    "character-art-lab": "dist/scripts/cal.js",
    "cal": "dist/scripts/cal.js"
  }
}
```

### 13.1 validate

```bash
npm run cal -- validate \
  --character examples/character-cards/fox-merchant.json
```

功能：校验角色卡、任务文件或 batch 文件。

---

### 13.2 render

```bash
npm run cal -- render \
  --character examples/character-cards/fox-merchant.json \
  --provider dashscope-qwen \
  --model qwen-image-2.0-pro \
  --size 1104*1472 \
  --n 4 \
  --out-dir out/fox-merchant
```

功能：生成单个角色的一组候选图。

输出：

```text
out/fox-merchant/
  character-card.json
  task.json
  images/
    fox-merchant-base-standing-0001.png
    fox-merchant-base-standing-0001.thumb.png
  manifests/
    fox-merchant-base-standing-0001.json
  report.json
```

---

### 13.3 batch

```bash
npm run cal -- batch \
  --input examples/batches/cozy-town-npcs.json \
  --out-dir out/cozy-town-npcs
```

功能：批量生成多个角色。

输出：

```text
out/cozy-town-npcs/
  batch-report.json
  fox-merchant/
  robot-guard/
  village-healer/
```

---

### 13.4 variant

```bash
npm run cal -- variant \
  --base out/fox-merchant/selected/base.png \
  --character examples/character-cards/fox-merchant.json \
  --variant expression:happy \
  --provider local-qwen \
  --out-dir out/fox-merchant/expressions
```

功能：基于已有主视觉生成差分。

---

### 13.5 inspect

```bash
npm run cal -- inspect \
  --manifest out/fox-merchant/manifests/fox-merchant-base-standing-0001.json
```

功能：查看 manifest 摘要。

---

### 13.6 pack

```bash
npm run cal -- pack \
  --portrait-set out/fox-merchant/portrait-set.json \
  --out out/fox-merchant-pack.zip
```

功能：打包游戏引擎导入需要的资产。

---

## 14. Web Studio 设计

### GitHub Pages 模式

只能提供：

```text
角色卡编辑器
Prompt preview
Mock gallery
Schema demo
文档入口
```

不能提供：

```text
真实 API 调用
用户 API Key 输入后前端直连 provider
云端代理
```

### Local Studio 模式

本地运行时可以提供真实生成：

```bash
npm run dev
npm run dev:server
```

### 页面结构

```text
Studio
  - Character Card
  - Style Preset
  - Task Type
  - Provider Settings
  - Prompt Preview
  - Generate
  - Gallery
  - Review
  - Export

Settings
  - Provider
  - Local Runner URL
  - Output Directory
  - Safety Notes

Docs
  - Quick Start
  - Local Deployment
  - Engine Integration
```

### 主要组件

```text
CharacterCardEditor
StylePresetSelector
TaskTypeSelector
PromptPreview
ProviderSelector
GeneratePanel
GalleryGrid
ImageReviewPanel
ManifestViewer
ExportPanel
```

---

## 15. Web Studio MVP 功能

v0.1 必做：

```text
[ ] 角色卡编辑器
[ ] Prompt preview
[ ] Mock provider 生成占位图
[ ] manifest 预览
[ ] 导出 character-card.json
[ ] 导出 generation-task.json
```

v0.2 再做：

```text
[ ] 本地生成结果 gallery
[ ] 人工评分
[ ] accept / reject
[ ] export pack
[ ] batch report viewer
```

---

## 16. Local Runner 设计

本地 Runner 是后期自部署稳定性的关键。

### 设计目标

- Node/TypeScript 主程序不直接依赖 PyTorch。
- Python runner 负责模型加载和推理。
- Node CLI 通过 HTTP 或 subprocess 与 runner 通讯。
- API provider 和 local provider 输出同样的 manifest。

### Runner 输入协议

```json
{
  "prompt": "full-body standing character illustration...",
  "negativePrompt": "low quality, extra fingers...",
  "width": 1104,
  "height": 1472,
  "seed": 42,
  "numInferenceSteps": 40,
  "outputPath": "out/image.png",
  "metadata": {
    "taskId": "fox-merchant-base-standing",
    "characterId": "fox-merchant"
  }
}
```

### Runner 输出协议

```json
{
  "ok": true,
  "images": [
    {
      "path": "out/image.png",
      "seed": 42,
      "width": 1104,
      "height": 1472
    }
  ],
  "runner": {
    "provider": "local-qwen",
    "model": "Qwen/Qwen-Image"
  }
}
```

### Runner 错误输出

```json
{
  "ok": false,
  "error": {
    "kind": "local_runner_unavailable",
    "message": "CUDA device not found or model path missing"
  }
}
```

---

## 17. 后处理设计

### v0.1 必做

```text
[ ] 保存 PNG
[ ] 生成缩略图
[ ] 计算图片 hash
[ ] 写入 manifest
[ ] 检查尺寸
```

### v0.3 再做

```text
[ ] 背景移除接口预留
[ ] upscale 接口预留
[ ] PNG metadata 写入
[ ] Alpha PNG 检查
```

### v0.5 再做

```text
[ ] 自动裁切透明边缘
[ ] 立绘边界检查
[ ] 手部/面部简单质检接口
[ ] 批量导出优化
```

### 透明底策略

第一版不要承诺模型直接生成透明底。更稳定的流程是：

```text
生成纯色或浅色背景
  ↓
后处理抠图
  ↓
人工 QA
  ↓
导入游戏引擎
```

---

## 18. Unity / Godot 集成路线

### 优先级

```text
Godot alpha > Unity alpha
```

原因：Godot 插件结构轻，适合第一版验证资产协议。

---

### 18.1 Godot 插件目标

路径：

```text
integrations/godot/addons/character_art_lab/
```

功能：

```text
[ ] 导入 portrait-set.json
[ ] 读取 PNG
[ ] 生成 PortraitSet Resource
[ ] 提供 DialoguePortraitPlayer.gd
[ ] 根据 expression key 切换 Texture2D
```

示例 Godot 资源：

```text
CharacterPortraitSet.tres
```

示例脚本：

```gdscript
extends Control

@export var portrait_set: Resource
@onready var portrait_texture: TextureRect = $PortraitTexture

func set_expression(expression_id: String) -> void:
    var texture = portrait_set.get_expression_texture(expression_id)
    if texture:
        portrait_texture.texture = texture
```

---

### 18.2 Unity 插件目标

路径：

```text
integrations/unity/com.example.character-art-lab/
```

功能：

```text
[ ] EditorWindow 导入 portrait-set.json
[ ] 读取 PNG 为 Sprite
[ ] 生成 ScriptableObject
[ ] 表情 key 映射 Sprite
```

示例 C# 类：

```csharp
[CreateAssetMenu(menuName = "Character Art Lab/Portrait Set")]
public class CharacterPortraitSet : ScriptableObject
{
    public string characterId;
    public Sprite basePortrait;
    public List<ExpressionSprite> expressions;
}

[Serializable]
public class ExpressionSprite
{
    public string expressionId;
    public Sprite sprite;
}
```

---

## 19. 版本路线图

## v0.1.0 — 最小可用开源版本

目标：能生成、能导出、能复现。

### 功能

```text
Web Studio
  [ ] 角色卡编辑器
  [ ] 风格 preset
  [ ] Prompt preview
  [ ] Mock provider 生成占位图
  [ ] 导出 character card JSON
  [ ] 导出 generation task JSON

CLI
  [ ] validate
  [ ] render
  [ ] 生成 PNG + image manifest JSON
  [ ] 支持 mock provider
  [ ] 支持 dashscope-qwen provider

Provider
  [ ] MockProvider
  [ ] DashScopeQwenProvider

Schema
  [ ] character-card 0.1
  [ ] generation-task 0.1
  [ ] image-asset 0.1

Docs
  [ ] README 英文
  [ ] README 中文
  [ ] Quick Start
  [ ] API Key 安全说明
  [ ] Licensing 说明
```

### 验收标准

```text
[ ] 可以从角色卡生成 prompt
[ ] 可以调用 DashScope Qwen API
[ ] 可以保存图片
[ ] 可以保存 manifest JSON
[ ] 同一任务的参数、prompt、provider、model 都能追溯
[ ] 没有 API Key 泄露到前端
```

---

## v0.2.0 — 批量生产版本

目标：让它变成真正的游戏资产工具。

### 功能

```text
[ ] 批量角色卡输入
[ ] batch schema
[ ] batch CLI
[ ] 任务队列
[ ] 失败重试
[ ] 成本/耗时统计
[ ] 图片 gallery
[ ] 人工评分
[ ] 批量导出 zip
```

### 验收标准

```text
[ ] 一次批量生成 10 个角色，每个角色 4 张候选图
[ ] 失败任务可重试
[ ] 每张图都有独立 manifest
[ ] 有 batch manifest 总结成本、耗时、失败原因
```

---

## v0.3.0 — 立绘差分与图像编辑

目标：从“生成图片”升级成“生产立绘资产”。

### 功能

```text
[ ] 表情差分
[ ] 服装差分
[ ] 局部编辑
[ ] 参考图输入
[ ] 同角色变体 manifest
[ ] base image hash 追踪
```

### Provider

```text
[ ] Qwen Image Edit provider
[ ] Local Qwen Image Edit runner placeholder
```

### 验收标准

```text
[ ] 能基于一张已选主视觉生成 happy / sad / angry / surprised 四个表情差分
[ ] manifest 记录 base image hash
[ ] 差分结果能关联回原角色
```

---

## v0.4.0 — Godot / Unity 导入

目标：复制 `mumble-voice-lab` 的 engine integration 成功路径。

### 功能

```text
Godot
  [ ] addon 文件夹
  [ ] dock UI
  [ ] 选择 manifest
  [ ] 导入 PNG
  [ ] 生成 PortraitSet .tres
  [ ] 简单 DialoguePortraitPlayer

Unity
  [ ] local UPM package
  [ ] EditorWindow
  [ ] 导入 manifest
  [ ] 生成 ScriptableObject
  [ ] 表情 key 映射 Sprite
```

### 验收标准

```text
[ ] Godot 能导入一个角色的 base + 4 表情
[ ] Unity 能导入同一套资产
[ ] manifest schema 在两个引擎中保持一致
```

---

## v0.5.0 — 本地部署 Runner

目标：把项目从“API 工具”转成“未来可自部署工具”。

### 功能

```text
[ ] local-runners/qwen-image/runner.py
[ ] local-runners/z-image/runner.py
[ ] requirements.txt
[ ] local provider
[ ] local-deployment.md
[ ] GPU/CPU 检查
[ ] 本地 runner 输出协议
[ ] HTTP server mode
[ ] subprocess mode
```

### 验收标准

```text
[ ] API provider 和 local provider 输出相同 schema
[ ] 本地 runner 不需要改 Web/CLI 的业务逻辑
[ ] README 能指导用户跑通一张本地生成图
```

---

## v0.6.0 — 角色一致性与 LoRA 准备

目标：不急着训练 LoRA，先把数据结构准备好。

### 功能

```text
[ ] 角色参考图集
[ ] 训练素材清洗
[ ] caption 生成
[ ] LoRA dataset manifest
[ ] 多角度图管理
[ ] 角色一致性 checklist
```

### LoRA Dataset Manifest 示例

```json
{
  "schema": "character-art-lab/lora-dataset",
  "schemaVersion": "0.1",
  "characterId": "fox-merchant",
  "images": [
    {
      "path": "references/front.png",
      "caption": "fox merchant girl, front view, full body, fox ears, amber hair"
    },
    {
      "path": "references/side.png",
      "caption": "fox merchant girl, side view, full body, fox ears, amber hair"
    }
  ],
  "notes": {
    "doNotTrain": ["rejected/bad-hands.png"],
    "style": "anime game standing illustration"
  }
}
```

### 验收标准

```text
[ ] 能把已选角色图整理成 LoRA 数据集
[ ] 能导出 caption 和 manifest
[ ] 暂时不承诺训练质量
```

---

## v1.0.0 — 稳定资产协议版本

v1.0 不需要模型能力爆炸，但要做到协议稳定。

### 稳定目标

```text
[ ] character-card schema 1.0
[ ] generation-task schema 1.0
[ ] image-asset schema 1.0
[ ] portrait-set schema 1.0
[ ] provider API 1.0
[ ] CLI 稳定
[ ] Web Studio 可用
[ ] DashScope API provider 可用
[ ] Local Qwen/Z runner 可用
[ ] Godot/Unity 至少一个稳定
[ ] 文档完整
[ ] 许可证边界清楚
```

---

## 20. 详细开发任务清单

### A. 仓库初始化

```text
[ ] 创建 repo：character-art-lab
[ ] 选择 Apache-2.0
[ ] 添加 README.md
[ ] 添加 README.zh-CN.md
[ ] 添加 CHANGELOG.md
[ ] 添加 MODEL_LICENSES.md
[ ] 添加 GENERATED_OUTPUT_POLICY.md
[ ] 添加 THIRD_PARTY_NOTICES.md
[ ] 初始化 Vite + React + TypeScript
[ ] 初始化 scripts/cal.ts CLI
[ ] 添加 GitHub Pages workflow
[ ] 添加 CI workflow
[ ] 添加 .gitignore
[ ] 添加 .env.example
```

---

### B. Schema 层

```text
[ ] character-card schema
[ ] generation-task schema
[ ] image-asset schema
[ ] batch schema
[ ] portrait-set schema
[ ] provider-capabilities schema
[ ] JSON schema 文档
[ ] schema versioning 规则
[ ] zod 校验器
```

版本规则：

```text
0.x：允许破坏性变更
1.x：schema 稳定
schemaVersion 单独维护，不完全等于 package version
```

---

### C. Prompt 层

```text
[ ] character-card-to-prompt
[ ] style preset
[ ] composition preset
[ ] negative preset
[ ] aspect ratio preset
[ ] task type preset
[ ] prompt preview formatter
```

---

### D. Provider 层

```text
[ ] Provider interface
[ ] MockProvider
[ ] DashScopeQwenProvider
[ ] LocalQwenProvider placeholder
[ ] LocalZImageProvider placeholder
[ ] Provider capability detection
[ ] Provider error normalization
[ ] Retry policy
[ ] Rate limit policy
[ ] Cost estimate hook
```

---

### E. CLI 层

```text
[ ] render 单张任务
[ ] batch 批量任务
[ ] variant 差分任务
[ ] inspect 查看 manifest
[ ] validate 校验 schema
[ ] pack 打包资产
[ ] clean 清理临时文件
```

---

### F. Web Studio 层

```text
[ ] 角色卡编辑器
[ ] Prompt preview
[ ] Provider 设置页
[ ] API Key 安全提示
[ ] Mock gallery
[ ] 本地生成结果 gallery
[ ] manifest 查看器
[ ] 评分面板
[ ] 导出 zip
```

---

### G. 本地 Runner 层

```text
[ ] qwen-image runner.py
[ ] z-image runner.py
[ ] HTTP server mode
[ ] subprocess mode
[ ] requirements.txt
[ ] GPU 检测
[ ] 输出 JSON 协议
[ ] 错误返回协议
[ ] local-deployment.md
```

---

### H. 后处理层

```text
[ ] 缩略图生成
[ ] 图片 hash
[ ] PNG metadata
[ ] manifest 写入
[ ] 简单尺寸校验
[ ] 可选背景移除接口预留
[ ] 可选 upscale 接口预留
```

---

### I. 引擎接入

```text
Godot
  [ ] addon 文件夹
  [ ] dock UI
  [ ] 选择 manifest
  [ ] 导入 PNG
  [ ] 生成 PortraitSet .tres
  [ ] DialoguePortraitPlayer

Unity
  [ ] local UPM package
  [ ] EditorWindow
  [ ] 导入 manifest
  [ ] 生成 ScriptableObject
  [ ] 表情 key 映射 Sprite
```

---

## 21. README 结构建议

```md
# Character Art Lab

Open-source character standing-art workflow for games.

Generate, edit, review, and export character portrait assets for indie games, visual novels, RPGs, and dialogue systems.

## Features

- Character Card schema
- Prompt Builder
- Provider-based image generation
- Qwen-Image / Z-Image compatible workflow
- CLI batch generation
- PNG + manifest export
- Local model runner roadmap
- Godot / Unity import roadmap

## What This Is

Character Art Lab is not a generic text-to-image playground. It is an editor-time asset pipeline for game character portraits.

## Current Status

Alpha / early development.

## Quick Start

## CLI

## Web Studio

## Provider Setup

## Local Runner

## Asset Schema

## Engine Integration

## Security Notes

## Licensing and Generated Output Policy

## Roadmap
```

中文 README：

```md
# Character Art Lab

面向游戏开发的开源角色立绘资产生成工作流。

它不是普通文生图网页，而是帮助独立游戏、视觉小说、RPG 项目管理角色卡、生成候选立绘、审查结果、导出 PNG + manifest，并为 Unity / Godot 导入做准备。

## 功能亮点

- 角色卡协议
- Prompt Builder
- Provider 抽象
- Qwen-Image / Z-Image 兼容工作流
- CLI 批量生成
- PNG + manifest 导出
- 本地模型 Runner 路线
- Godot / Unity 导入路线
```

---

## 22. 许可证与合规策略

### 项目代码

建议：

```text
Apache-2.0
```

原因：

```text
适合开源工具
适合未来公司商用
适合插件、CLI、SDK、私有化部署
```

### 模型权重

不要把模型权重放进仓库。

README 需要写：

```text
This repository does not redistribute model weights.
Local model users must download model weights from upstream model repositories and comply with their licenses.
```

### 生成图片

不要写“所有输出可自由商用”。

建议写：

```text
The project code is Apache-2.0 licensed.
Generated images are not licensed by this repository.
Their usage depends on your input rights, selected provider, selected model, and applicable platform/model terms.
```

中文：

```text
本仓库代码使用 Apache-2.0 许可证。
生成图片不由本仓库授予统一授权。
生成图片的使用权取决于用户输入素材、所选 provider、所选模型以及对应平台/模型条款。
```

### 用户上传参考图

必须提醒用户：

```text
Only use reference images that you own or have permission to use.
Do not use copyrighted characters, celebrities, private individuals, or third-party artworks without proper rights.
```

---

## 23. 商业化预留路线

### 开源部分

```text
Web Studio
CLI
Schema
Provider adapters
Local runners
Basic Godot/Unity importers
Prompt templates
Docs
```

### 未来商业部分

```text
托管 GPU 生成服务
团队资产库
私有化部署
角色 LoRA 训练服务
企业版 Unity/Godot 插件
多用户协作
审计日志
版权/合规工作流
高速队列
云端批量渲染
```

### 不冲突原则

开源项目负责开发者入口和标准协议。商业版本负责稳定算力、团队协作、私有部署和企业支持。

---

## 24. 第一阶段开发节奏

### 第 1 周：项目骨架

```text
[ ] 创建 repo
[ ] 初始化 Vite + React + TypeScript
[ ] 初始化 CLI
[ ] 加 README / LICENSE / CHANGELOG
[ ] 加 character-card schema
[ ] 加 mock provider
[ ] GitHub Pages mock demo
```

产出：

```text
能打开网页
能编辑角色卡
能预览 prompt
能用 mock provider 生成占位图和 manifest
```

---

### 第 2 周：DashScope Qwen API

```text
[ ] DashScopeQwenProvider
[ ] .env.example
[ ] API Key 安全说明
[ ] CLI render
[ ] 输出 PNG + manifest
[ ] 错误处理
[ ] size / negative_prompt / prompt_extend / watermark 参数
```

产出：

```text
能真实调用 Qwen Image API 生成立绘
```

---

### 第 3 周：批量生成

```text
[ ] batch schema
[ ] batch CLI
[ ] 任务队列
[ ] 失败重试
[ ] batch manifest
[ ] 成本/耗时记录
[ ] Gallery 页面
```

产出：

```text
能一次生成 10 个 NPC 角色包
```

---

### 第 4 周：资产审查与导出

```text
[ ] 评分系统
[ ] accept / reject
[ ] selected asset
[ ] portrait-set schema
[ ] export pack
[ ] thumbnail
[ ] docs/asset-schema.md
```

产出：

```text
能从候选图中选主视觉，并导出一个角色立绘资产包
```

---

### 第 5 周：图像编辑 / 差分

```text
[ ] edit provider placeholder
[ ] expression variant task
[ ] costume variant task
[ ] base image hash
[ ] reference image input
[ ] variant manifest
```

产出：

```text
能基于主视觉生成 happy / sad / angry / surprised 四个表情差分
```

---

### 第 6 周：Godot 插件 alpha

```text
[ ] Godot addon
[ ] 导入 PNG + manifest
[ ] 生成 PortraitSet .tres
[ ] DialoguePortraitPlayer
[ ] docs/integrations.md
[ ] headless smoke test
```

产出：

```text
Godot 可以导入角色立绘资产，并按 expression key 切换图片
```

---

### 第 7 周：本地 Qwen / Z-Image Runner

```text
[ ] local-runners/qwen-image/runner.py
[ ] local-runners/z-image/runner.py
[ ] requirements.txt
[ ] local provider
[ ] local-deployment.md
[ ] GPU/CPU 检查
[ ] 本地 runner 输出协议
```

产出：

```text
不用云端 API，也能通过本地模型生成同样 schema 的资产
```

---

### 第 8 周：首次公开发布整理

```text
[ ] README 重写
[ ] README.zh-CN.md
[ ] CHANGELOG
[ ] release QA
[ ] 示例角色卡
[ ] 示例输出图占位
[ ] demo video / gif
[ ] GitHub release
```

产出：

```text
第一个公开可用版本
```

---

## 25. 第一版功能优先级

### 必须做

```text
[ ] 角色卡
[ ] Prompt Builder
[ ] DashScope Qwen Provider
[ ] Mock Provider
[ ] CLI render
[ ] CLI batch
[ ] PNG + manifest
[ ] README
[ ] 许可证说明
[ ] API Key 安全说明
```

### 应该做

```text
[ ] Web Studio
[ ] Gallery
[ ] 人工评分
[ ] 导出 zip
[ ] 本地 runner placeholder
[ ] Godot alpha
```

### 可以晚点做

```text
[ ] Unity 插件
[ ] LoRA 训练
[ ] 背景移除
[ ] 超分
[ ] 多 provider
[ ] ComfyUI workflow
[ ] 团队协作
```

---

## 26. 不建议第一版做的事

```text
[ ] 不要第一版就接 6 家 API
[ ] 不要第一版就做完整 LoRA 训练
[ ] 不要把闭源模型独有能力写成核心依赖
[ ] 不要把 API Key 放进 GitHub Pages
[ ] 不要承诺生成图片一定可商用
[ ] 不要把模型权重放进仓库
[ ] 不要做运行时实时生成
```

---

## 27. 测试与 QA

### 单元测试

```text
[ ] CharacterCard schema validation
[ ] GenerationTask schema validation
[ ] Prompt Builder output
[ ] Provider error normalization
[ ] Manifest writer
[ ] Batch parser
```

### 集成测试

```text
[ ] Mock provider render
[ ] CLI render with mock provider
[ ] CLI batch with mock provider
[ ] Pack export
[ ] Manifest inspect
```

### 手动测试

```text
[ ] Web Studio 角色卡编辑
[ ] Prompt preview
[ ] Mock gallery
[ ] DashScope real provider render
[ ] 输出文件检查
[ ] API Key 不进入浏览器 bundle
```

### Release QA Checklist

```text
[ ] npm install 成功
[ ] npm run build 成功
[ ] npm run test 成功
[ ] npm run cal -- validate 成功
[ ] npm run cal -- render --provider mock 成功
[ ] README 快速开始可跑通
[ ] .env 未被提交
[ ] GitHub Pages 只使用 mock provider
[ ] LICENSE / MODEL_LICENSES / GENERATED_OUTPUT_POLICY 存在
```

---

## 28. 本地 AI 编程助手执行顺序

给本地 AI 的指令可以这样下：

```text
请基于 character-art-lab_project_plan.md 开始实现项目。
先完成 v0.1.0 的最小可用版本，不要跳到后续版本。
优先级如下：
1. 初始化 Vite + React + TypeScript 项目
2. 创建 core schemas 和 zod 校验
3. 创建 prompt builder
4. 创建 provider interface 和 MockProvider
5. 创建 CLI validate/render 命令
6. 创建 Web Studio 的角色卡编辑和 Prompt Preview
7. 创建 manifest writer
8. 添加 README / README.zh-CN / LICENSE / .env.example

不要实现真实云端 API，直到 mock provider、schema、CLI 和 manifest 都跑通。
```

当 v0.1 骨架跑通后，再下第二条指令：

```text
现在实现 DashScopeQwenProvider。
要求：
1. API Key 只从 process.env.DASHSCOPE_API_KEY 读取
2. 不允许前端直接调用 provider
3. CLI render 可以调用 provider
4. provider 返回的图片必须保存到 out 目录
5. 每张图片必须有 image-asset manifest
6. 出错时归一化为 ProviderErrorKind
```

---

## 29. 最小 v0.1 验收 Demo

完成 v0.1 后，应该可以跑：

```bash
npm install
npm run dev
```

浏览器中可以：

```text
1. 打开 Character Card 编辑器
2. 修改角色信息
3. 查看 Prompt Preview
4. 点击 Mock Generate
5. 看到占位图
6. 导出 character-card.json 和 generation-task.json
```

CLI 中可以：

```bash
npm run cal -- validate \
  --character examples/character-cards/fox-merchant.json

npm run cal -- render \
  --character examples/character-cards/fox-merchant.json \
  --provider mock \
  --model mock-image \
  --size 1104*1472 \
  --n 4 \
  --out-dir out/fox-merchant
```

输出目录应包含：

```text
out/fox-merchant/
  character-card.json
  task.json
  images/
    fox-merchant-base-standing-0001.png
    fox-merchant-base-standing-0002.png
    fox-merchant-base-standing-0003.png
    fox-merchant-base-standing-0004.png
  manifests/
    fox-merchant-base-standing-0001.json
    fox-merchant-base-standing-0002.json
    fox-merchant-base-standing-0003.json
    fox-merchant-base-standing-0004.json
  report.json
```

---

## 30. 长期成功标准

项目长期做成以后，应该满足：

```text
[ ] 独立游戏作者可以不懂模型，也能用角色卡生成立绘候选
[ ] 有 API 的人可以快速调用云端生成
[ ] 有 GPU 的人可以本地部署生成
[ ] 游戏项目可以直接导入 PNG + manifest
[ ] 每张图都能追溯 prompt、模型、参数和来源
[ ] 角色差分能够关联同一角色主视觉
[ ] 项目代码、模型权重、生成图片的权利边界清楚
[ ] 后期公司化时可以自然扩展成托管服务和私有部署服务
```

---

## 31. 最终建议

`character-art-lab` 不应该追求“第一版模型效果最强”，而应该先建立稳定的资产协议和工具链。

第一版的核心价值是：

```text
Character Card
Prompt Builder
Provider 抽象
CLI 批量生成
PNG + manifest
Mock / DashScope / Local Runner 路线
```

只要这套骨架稳定，后续不管换 Qwen、Z-Image、ComfyUI、其他国内 API，还是私有化部署，都不会推翻项目。

**一句话目标：做一个给游戏开发者用的开源角色立绘资产流水线，而不是又一个文生图网页。**
