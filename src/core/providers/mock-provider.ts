import path from "node:path";
import type { GeneratedImage, GenerateImageRequest, ImageProvider } from "./provider-capabilities";
import { writePlaceholderPng } from "../assets/placeholder-png";

function outputDirFromMetadata(metadata: Record<string, unknown> | undefined): string {
  const value = metadata?.outputDir;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("MockProvider requires metadata.outputDir.");
  }
  return value;
}

export class MockProvider implements ImageProvider {
  readonly id = "mock" as const;
  readonly name = "MockProvider";

  getCapabilities() {
    return {
      textToImage: true,
      imageToImage: false,
      imageEdit: false,
      multiReference: false,
      negativePrompt: true,
      seed: true,
      batch: true,
      maxImagesPerRequest: 16,
      supportedSizes: ["768*1024", "1024*1024", "1104*1472"]
    };
  }

  async generate(request: GenerateImageRequest): Promise<GeneratedImage[]> {
    const outputDir = outputDirFromMetadata(request.metadata);
    const imagesDir = path.join(outputDir, "images");
    const generated: GeneratedImage[] = [];

    for (let index = 0; index < request.n; index += 1) {
      const sequence = String(index + 1).padStart(4, "0");
      const id = `${request.taskId}-${sequence}`;
      const imagePath = path.join(imagesDir, `${id}.png`);
      const dimensions = await writePlaceholderPng({
        size: request.size,
        outputPath: imagePath,
        seed: (request.seed ?? 0) + index + 1
      });

      generated.push({
        id,
        imagePath,
        width: dimensions.width,
        height: dimensions.height,
        provider: this.id,
        model: request.model,
        seed: request.seed == null ? undefined : request.seed + index,
        rawResponse: {
          provider: this.id,
          promptLength: request.prompt.length,
          negativePromptLength: request.negativePrompt?.length ?? 0
        }
      });
    }

    return generated;
  }
}
