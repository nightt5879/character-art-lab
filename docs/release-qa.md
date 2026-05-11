# Release QA

Run this checklist before tagging a public release.

```bash
npm install
npm run test
npm run build
npm run cal -- validate --character examples/character-cards/fox-merchant.json
npm run cal -- render --character examples/character-cards/fox-merchant.json --provider mock --model mock-image --size 120*160 --n 2 --out-dir out/release-mock
npm run cal -- inspect --manifest out/release-mock/manifests/fox-merchant-base-standing-0001.json
npm run cal -- review --manifest out/release-mock/manifests/fox-merchant-base-standing-0001.json --status accepted --note "Release QA mock asset"
```

Optional real-provider smoke:

```bash
npm run cal -- render --character examples/character-cards/fox-merchant.json --provider dashscope-qwen --model qwen-image-2.0-pro --size 1104*1472 --n 1 --out-dir out/release-qwen
```

Confirm:

- `.env` is not committed.
- `out/`, `dist/`, and `node_modules/` are ignored.
- README and docs mention that generated images are not licensed by this repository.
- Web Studio does not expose a real API key input.
