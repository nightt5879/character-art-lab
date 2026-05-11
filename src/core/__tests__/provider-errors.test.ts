import { describe, expect, it } from "vitest";
import { normalizeProviderError, ProviderError } from "../providers/provider-errors";

describe("provider errors", () => {
  it("normalizes missing key errors", () => {
    const normalized = normalizeProviderError(new Error("API key missing"), {
      provider: "mock",
      model: "mock-image"
    });

    expect(normalized.kind).toBe("missing_api_key");
  });

  it("preserves ProviderError details", () => {
    const normalized = normalizeProviderError(
      new ProviderError({
        kind: "rate_limited",
        message: "rate limit exceeded",
        provider: "mock",
        model: "mock-image"
      }),
      {
        provider: "mock",
        model: "mock-image"
      }
    );

    expect(normalized.kind).toBe("rate_limited");
    expect(normalized.provider).toBe("mock");
  });

  it("normalizes DashScope content policy-like messages", () => {
    const normalized = normalizeProviderError(new Error("DataInspection failed by content safety policy"), {
      provider: "dashscope-qwen",
      model: "qwen-image-2.0-pro"
    });

    expect(normalized.kind).toBe("content_policy");
  });
});
