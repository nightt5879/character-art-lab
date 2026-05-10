import type { ImageProviderKind } from "../schemas";

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
  provider: ImageProviderKind | string;
  model?: string;
  raw?: unknown;
}

export class ProviderError extends Error {
  readonly kind: ProviderErrorKind;
  readonly provider: ImageProviderKind | string;
  readonly model?: string;
  readonly raw?: unknown;

  constructor(error: NormalizedProviderError) {
    super(error.message);
    this.name = "ProviderError";
    this.kind = error.kind;
    this.provider = error.provider;
    this.model = error.model;
    this.raw = error.raw;
  }
}

export function normalizeProviderError(
  error: unknown,
  context: { provider: ImageProviderKind | string; model?: string }
): NormalizedProviderError {
  if (error instanceof ProviderError) {
    return {
      kind: error.kind,
      message: error.message,
      provider: error.provider,
      model: error.model,
      raw: error.raw
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  let kind: ProviderErrorKind = "unknown";
  if (lower.includes("api key") || lower.includes("apikey") || lower.includes("unauthorized")) {
    kind = "missing_api_key";
  } else if (lower.includes("rate limit") || lower.includes("too many requests") || lower.includes("429")) {
    kind = "rate_limited";
  } else if (lower.includes("policy") || lower.includes("safety") || lower.includes("content")) {
    kind = "content_policy";
  } else if (lower.includes("size") || lower.includes("dimension")) {
    kind = "invalid_size";
  } else if (lower.includes("network") || lower.includes("fetch") || lower.includes("timeout")) {
    kind = "network_error";
  }

  return {
    kind,
    message,
    provider: context.provider,
    model: context.model,
    raw: error
  };
}
