import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratedImage, GenerateImageRequest, ImageProvider } from "./provider-capabilities";
import { ProviderError, type ProviderErrorKind } from "./provider-errors";

export interface DashScopeQwenProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
}

interface DashScopeContentItem {
  image?: unknown;
  text?: unknown;
}

interface DashScopeResponseBody {
  output?: {
    choices?: Array<{
      finish_reason?: string;
      message?: {
        role?: string;
        content?: DashScopeContentItem[];
      };
    }>;
  };
  usage?: {
    width?: number;
    height?: number;
    image_count?: number;
  };
  request_id?: string;
  code?: string;
  message?: string;
}

function envValue(name: string): string | undefined {
  return typeof process !== "undefined" ? process.env[name] : undefined;
}

function normalizeBaseUrl(baseUrl: string | undefined): string {
  const raw = baseUrl?.trim() || "https://dashscope.aliyuncs.com";
  const withoutSlash = raw.replace(/\/+$/, "");

  if (withoutSlash.endsWith("/services/aigc/multimodal-generation/generation")) {
    return withoutSlash;
  }

  if (withoutSlash.endsWith("/api/v1")) {
    return `${withoutSlash}/services/aigc/multimodal-generation/generation`;
  }

  return `${withoutSlash}/api/v1/services/aigc/multimodal-generation/generation`;
}

function outputDirFromMetadata(metadata: Record<string, unknown> | undefined): string {
  const value = metadata?.outputDir;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("DashScopeQwenProvider requires metadata.outputDir.");
  }
  return value;
}

function classifyDashScopeError(status: number, body: unknown): ProviderErrorKind {
  const text = JSON.stringify(body).toLowerCase();

  if (status === 401 || status === 403 || text.includes("api key") || text.includes("apikey")) {
    return "missing_api_key";
  }
  if (status === 429 || text.includes("rate") || text.includes("throttl") || text.includes("too many")) {
    return "rate_limited";
  }
  if (text.includes("policy") || text.includes("safety") || text.includes("content") || text.includes("datainspection")) {
    return "content_policy";
  }
  if (text.includes("size") || text.includes("dimension") || text.includes("resolution")) {
    return "invalid_size";
  }

  return "provider_error";
}

function collectImageUrls(body: DashScopeResponseBody): string[] {
  const choices = body.output?.choices ?? [];
  return choices.flatMap((choice) =>
    (choice.message?.content ?? [])
      .map((item) => item.image)
      .filter((value): value is string => typeof value === "string" && value.length > 0)
  );
}

async function readResponseBody(response: Response): Promise<DashScopeResponseBody | Record<string, unknown>> {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as DashScopeResponseBody | Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

function assertModelRequestSupported(request: GenerateImageRequest): void {
  const isQwen20 = request.model.startsWith("qwen-image-2.0");
  if (request.n > 6) {
    throw new ProviderError({
      kind: "invalid_size",
      message: "DashScope Qwen image generation supports at most 6 images per request.",
      provider: "dashscope-qwen",
      model: request.model
    });
  }

  if (!isQwen20 && request.n !== 1) {
    throw new ProviderError({
      kind: "provider_error",
      message: `Model "${request.model}" supports n=1 only. Use qwen-image-2.0-pro for multiple variants.`,
      provider: "dashscope-qwen",
      model: request.model
    });
  }
}

export class DashScopeQwenProvider implements ImageProvider {
  readonly id = "dashscope-qwen" as const;
  readonly name = "DashScope Qwen Image";
  private readonly apiKey?: string;
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: DashScopeQwenProviderOptions = {}) {
    this.apiKey = options.apiKey ?? envValue("DASHSCOPE_API_KEY");
    this.endpoint = normalizeBaseUrl(options.baseUrl ?? envValue("DASHSCOPE_BASE_URL"));
    this.fetchImpl = options.fetch ?? fetch;
  }

  getCapabilities() {
    return {
      textToImage: true,
      imageToImage: false,
      imageEdit: false,
      multiReference: false,
      negativePrompt: true,
      seed: true,
      batch: false,
      maxImagesPerRequest: 6,
      supportedSizes: [
        "2048*2048",
        "1536*2688",
        "2688*1536",
        "1728*2368",
        "2368*1728",
        "1104*1472",
        "1472*1104",
        "1328*1328",
        "928*1664",
        "1664*928"
      ]
    };
  }

  async generate(request: GenerateImageRequest): Promise<GeneratedImage[]> {
    if (!this.apiKey) {
      throw new ProviderError({
        kind: "missing_api_key",
        message: "DASHSCOPE_API_KEY is required for dashscope-qwen.",
        provider: this.id,
        model: request.model
      });
    }

    assertModelRequestSupported(request);
    const outputDir = outputDirFromMetadata(request.metadata);
    const imagesDir = path.join(outputDir, "images");
    await mkdir(imagesDir, { recursive: true });

    const body = {
      model: request.model,
      input: {
        messages: [
          {
            role: "user",
            content: [
              {
                text: request.prompt
              }
            ]
          }
        ]
      },
      parameters: {
        negative_prompt: request.negativePrompt ?? "",
        size: request.size,
        n: request.n,
        prompt_extend: Boolean(request.metadata?.promptExtend ?? false),
        watermark: Boolean(request.metadata?.watermark ?? false),
        ...(request.seed == null ? {} : { seed: request.seed })
      }
    };

    let response: Response;
    try {
      response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body)
      });
    } catch (error) {
      throw new ProviderError({
        kind: "network_error",
        message: error instanceof Error ? error.message : String(error),
        provider: this.id,
        model: request.model,
        raw: error
      });
    }

    const responseBody = await readResponseBody(response);

    if (!response.ok || "code" in responseBody) {
      throw new ProviderError({
        kind: classifyDashScopeError(response.status, responseBody),
        message:
          typeof responseBody.message === "string"
            ? responseBody.message
            : `DashScope request failed with HTTP ${response.status}.`,
        provider: this.id,
        model: request.model,
        raw: responseBody
      });
    }

    const imageUrls = collectImageUrls(responseBody as DashScopeResponseBody);
    if (imageUrls.length === 0) {
      throw new ProviderError({
        kind: "provider_error",
        message: "DashScope response did not include generated image URLs.",
        provider: this.id,
        model: request.model,
        raw: responseBody
      });
    }

    const generated: GeneratedImage[] = [];
    for (let index = 0; index < imageUrls.length; index += 1) {
      const sequence = String(index + 1).padStart(4, "0");
      const id = `${request.taskId}-${sequence}`;
      const imagePath = path.join(imagesDir, `${id}.png`);
      const imageResponse = await this.fetchImpl(imageUrls[index]);

      if (!imageResponse.ok) {
        throw new ProviderError({
          kind: "network_error",
          message: `Failed to download generated image ${index + 1}: HTTP ${imageResponse.status}.`,
          provider: this.id,
          model: request.model,
          raw: { url: imageUrls[index], status: imageResponse.status }
        });
      }

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      await writeFile(imagePath, imageBuffer);

      generated.push({
        id,
        imagePath,
        width: (responseBody as DashScopeResponseBody).usage?.width,
        height: (responseBody as DashScopeResponseBody).usage?.height,
        provider: this.id,
        model: request.model,
        seed: request.seed == null ? undefined : request.seed + index,
        rawResponse: {
          requestId: (responseBody as DashScopeResponseBody).request_id,
          usage: (responseBody as DashScopeResponseBody).usage,
          imageUrl: imageUrls[index]
        }
      });
    }

    return generated;
  }
}
