# Asset Schema

The v0.1.2 asset contract is intentionally small and JSON-based.

## Character Card

Describes identity, visual traits, outfit, style, and constraints.

```text
character-art-lab/character-card
```

Example:

```text
examples/character-cards/fox-merchant.json
```

## Generation Task

Describes task type, provider, model, size, image count, and output settings.

```text
character-art-lab/generation-task
```

## Image Asset Manifest

Tracks each generated PNG:

- asset id
- character id
- task id
- provider and model
- prompt
- generation parameters
- source image links
- review status

```text
character-art-lab/image-asset
```

## Render Report

Summarizes one render run:

- task id
- provider
- model
- duration
- success or failure
- generated manifest paths
- normalized error details when failed

## Versioning

`schemaVersion` is separate from package version. During `0.x`, breaking schema changes are allowed.
