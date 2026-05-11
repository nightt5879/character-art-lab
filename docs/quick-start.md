# Quick Start

Character Art Lab is an editor-time asset pipeline for game character standing art.

## Install

```bash
npm install
```

## Web Studio

```bash
npm run dev
```

The Web Studio is a browser-only demo. It edits a character card, previews the prompt, generates mock gallery items, and exports JSON. It does not call real providers or accept API keys.

## Mock Render

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

## DashScope Render

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

## Review

```bash
npm run cal -- inspect --manifest out/fox-merchant-qwen/manifests/fox-merchant-base-standing-0001.json

npm run cal -- review \
  --manifest out/fox-merchant-qwen/manifests/fox-merchant-base-standing-0001.json \
  --status accepted \
  --note "Good base silhouette"
```
