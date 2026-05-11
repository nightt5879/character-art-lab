# Character Art Lab

Open-source character standing-art workflow for games.

Character Art Lab is not a generic text-to-image playground. It is an editor-time asset pipeline for indie games, visual novels, RPGs, and dialogue systems.

## Current Status

Alpha / protocol MVP.

The current release focuses on:

- Character Card schema
- Prompt Builder
- Provider abstraction
- MockProvider
- DashScope Qwen provider for local CLI use
- CLI `validate` and `render`
- PNG + image manifest output
- Web Studio with character editing, prompt preview, mock generation, and JSON export

## Quick Start

```bash
npm install
npm run dev
```

Run the CLI with the mock provider:

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

Run the CLI with DashScope Qwen after setting an API key:

```bash
export DASHSCOPE_API_KEY="sk-your-key"
export DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com"

npm run cal -- render \
  --character examples/character-cards/fox-merchant.json \
  --provider dashscope-qwen \
  --model qwen-image-2.0-pro \
  --size 1104*1472 \
  --n 1 \
  --out-dir out/fox-merchant-qwen
```

PowerShell:

```powershell
$env:DASHSCOPE_API_KEY="sk-your-key"
$env:DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com"
```

The render command writes:

```text
out/fox-merchant/
  character-card.json
  task.json
  images/
  manifests/
  report.json
```

## Security Notes

Do not put API keys in frontend code. Do not commit `.env` files.

The hosted demo must only use `MockProvider`. Real provider calls should run locally through the CLI or through a backend controlled by the user.

## DashScope Setup

1. Create an API key in Alibaba Cloud Model Studio / Bailian.
2. Pick the matching endpoint for the key region:
   - Beijing: `https://dashscope.aliyuncs.com`
   - Singapore: `https://dashscope-intl.aliyuncs.com`
3. Set `DASHSCOPE_API_KEY` and optionally `DASHSCOPE_BASE_URL`.
4. Use `--provider dashscope-qwen` from the CLI.

Official references:

- https://help.aliyun.com/zh/model-studio/qwen-image-api
- https://www.alibabacloud.com/help/en/model-studio/text-to-image
- https://www.alibabacloud.com/help/en/model-studio/rate-limit

## Roadmap

- v0.2: Batch schema, batch CLI, queueing, retry, gallery, and zip export.
- v0.3: Expression, costume, and pose variants with source image tracking.
- v0.4: Godot alpha importer.
- v0.5: Local Qwen/Z-Image runner protocol.

## Licensing

Project code is intended for Apache-2.0 licensing. Generated images are not licensed by this repository; see `GENERATED_OUTPUT_POLICY.md`.
