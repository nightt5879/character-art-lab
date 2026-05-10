# Character Art Lab

Open-source character standing-art workflow for games.

Character Art Lab is not a generic text-to-image playground. It is an editor-time asset pipeline for indie games, visual novels, RPGs, and dialogue systems.

## Current Status

Alpha / protocol MVP.

The first release focuses on:

- Character Card schema
- Prompt Builder
- Provider abstraction
- MockProvider
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

## Roadmap

- v0.1.1: DashScope Qwen provider for local CLI use only.
- v0.2: Batch schema, batch CLI, queueing, retry, gallery, and zip export.
- v0.3: Expression, costume, and pose variants with source image tracking.
- v0.4: Godot alpha importer.
- v0.5: Local Qwen/Z-Image runner protocol.

## Licensing

Project code is intended for Apache-2.0 licensing. Generated images are not licensed by this repository; see `GENERATED_OUTPUT_POLICY.md`.
