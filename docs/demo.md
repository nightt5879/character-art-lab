# Demo Flow

This is the v0.1.2 public MVP demo path.

## 1. Validate a Character Card

```bash
npm run cal -- validate --character examples/character-cards/fox-merchant.json
```

## 2. Render with MockProvider

```bash
npm run cal -- render \
  --character examples/character-cards/fox-merchant.json \
  --provider mock \
  --model mock-image \
  --size 1104*1472 \
  --n 4 \
  --out-dir out/fox-merchant
```

Expected output:

```text
out/fox-merchant/
  character-card.json
  task.json
  images/
  manifests/
  report.json
```

## 3. Render with DashScope Qwen

Set `DASHSCOPE_API_KEY`, then run:

```bash
npm run cal -- render \
  --character examples/character-cards/fox-merchant.json \
  --provider dashscope-qwen \
  --model qwen-image-2.0-pro \
  --size 1104*1472 \
  --n 1 \
  --out-dir out/fox-merchant-qwen
```

## 4. Inspect and Review

```bash
npm run cal -- inspect --manifest out/fox-merchant-qwen/manifests/fox-merchant-base-standing-0001.json

npm run cal -- review \
  --manifest out/fox-merchant-qwen/manifests/fox-merchant-base-standing-0001.json \
  --status accepted \
  --note "Approved for first portrait set"
```

Generated output files are intentionally ignored by Git.
