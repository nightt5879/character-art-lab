import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DashScopeQwenProvider } from "../providers/dashscope-qwen-provider";
import { ProviderError } from "../providers/provider-errors";

const tempDirs: string[] = [];
const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function makeRequest(outputDir: string) {
  return {
    taskId: "fox-merchant-base-standing",
    prompt: "full-body standing character illustration",
    negativePrompt: "watermark",
    size: "1104*1472",
    n: 1,
    seed: 42,
    model: "qwen-image-2.0-pro",
    metadata: {
      outputDir,
      promptExtend: false,
      watermark: false
    }
  };
}

describe("DashScopeQwenProvider", () => {
  it("requires an API key", async () => {
    const provider = new DashScopeQwenProvider({
      apiKey: "",
      fetch: async () => new Response("{}", { status: 200 })
    });

    await expect(provider.generate(makeRequest("out"))).rejects.toMatchObject({
      name: "ProviderError",
      kind: "missing_api_key"
    });
  });

  it("sends the expected request and downloads returned images", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "cal-dashscope-"));
    tempDirs.push(outDir);
    const requests: Array<{ url: string; init?: RequestInit }> = [];

    const provider = new DashScopeQwenProvider({
      apiKey: "sk-test",
      baseUrl: "https://dashscope.aliyuncs.com",
      fetch: async (url, init) => {
        requests.push({ url: String(url), init });
        if (String(url).includes("multimodal-generation")) {
          return new Response(
            JSON.stringify({
              output: {
                choices: [
                  {
                    finish_reason: "stop",
                    message: {
                      role: "assistant",
                      content: [{ image: "https://example.com/generated.png" }]
                    }
                  }
                ]
              },
              usage: {
                width: 1104,
                height: 1472,
                image_count: 1
              },
              request_id: "req-test"
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(pngBytes, { status: 200, headers: { "Content-Type": "image/png" } });
      }
    });

    const images = await provider.generate(makeRequest(outDir));

    expect(images).toHaveLength(1);
    expect(images[0].provider).toBe("dashscope-qwen");
    await expect(stat(path.join(outDir, "images", "fox-merchant-base-standing-0001.png"))).resolves.toBeTruthy();
    await expect(readFile(path.join(outDir, "images", "fox-merchant-base-standing-0001.png"))).resolves.toEqual(Buffer.from(pngBytes));

    const apiRequest = requests[0];
    expect(apiRequest.url).toBe("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation");
    expect((apiRequest.init?.headers as Record<string, string>).Authorization).toBe("Bearer sk-test");
    const body = JSON.parse(String(apiRequest.init?.body));
    expect(body.model).toBe("qwen-image-2.0-pro");
    expect(body.input.messages[0].role).toBe("user");
    expect(body.input.messages[0].content[0].text).toBe("full-body standing character illustration");
    expect(body.parameters.negative_prompt).toBe("watermark");
    expect(body.parameters.size).toBe("1104*1472");
    expect(body.parameters.n).toBe(1);
    expect(body.parameters.seed).toBe(42);
    expect(body.parameters.prompt_extend).toBe(false);
    expect(body.parameters.watermark).toBe(false);
  });

  it("normalizes provider errors", async () => {
    const provider = new DashScopeQwenProvider({
      apiKey: "sk-test",
      fetch: async () =>
        new Response(
          JSON.stringify({
            request_id: "req-error",
            code: "InvalidParameter",
            message: "size is invalid"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
    });

    await expect(provider.generate(makeRequest("out"))).rejects.toMatchObject({
      name: "ProviderError",
      kind: "invalid_size"
    });
  });

  it("limits multi-image requests to qwen-image-2.0 models", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "cal-dashscope-"));
    tempDirs.push(outDir);
    const provider = new DashScopeQwenProvider({
      apiKey: "sk-test",
      fetch: async () => new Response("{}", { status: 200 })
    });

    await expect(
      provider.generate({
        ...makeRequest(outDir),
        model: "qwen-image-plus",
        n: 2
      })
    ).rejects.toBeInstanceOf(ProviderError);
  });
});
