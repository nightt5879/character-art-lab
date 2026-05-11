# Provider API

Providers implement a small common interface so the pipeline does not depend on one image service.

```ts
export interface ImageProvider {
  id: ImageProviderKind;
  name: string;
  getCapabilities(): ImageProviderCapabilities;
  generate(request: GenerateImageRequest): Promise<GeneratedImage[]>;
  edit?(request: GenerateImageRequest): Promise<GeneratedImage[]>;
}
```

## Implemented Providers

- `mock`: writes local placeholder PNGs for demos and tests.
- `dashscope-qwen`: calls DashScope Qwen Image from the local CLI.

## Security Boundary

Real providers must run in Node contexts controlled by the user, such as the CLI or a local backend. Frontend code must not read, store, or send API keys.

## Output Contract

Every provider returns `GeneratedImage[]`. The render pipeline then writes PNGs, image manifests, and a render report using the same schema regardless of provider.

## Errors

Provider errors should be normalized into:

```text
missing_api_key
rate_limited
content_policy
invalid_size
network_error
provider_error
local_runner_unavailable
file_write_error
unknown
```
