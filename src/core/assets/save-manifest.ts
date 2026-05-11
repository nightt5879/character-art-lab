import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CharacterCard, GenerationTask, ImageAssetManifest } from "../schemas";
import { createPendingReview } from "../schemas/image-asset";
import type { BuiltPrompt } from "../prompt/prompt-builder";
import type { GeneratedImage } from "../providers/provider-capabilities";

export interface BuildManifestInput {
  character: CharacterCard;
  task: GenerationTask;
  prompt: BuiltPrompt;
  generatedImage: GeneratedImage;
  imageRelativePath: string;
  rawCharacterCardPath?: string;
}

export function buildImageAssetManifest(input: BuildManifestInput): ImageAssetManifest {
  return {
    schema: "character-art-lab/image-asset",
    schemaVersion: "0.1",
    assetId: input.generatedImage.id,
    characterId: input.character.id,
    taskId: input.task.id,
    createdAt: new Date().toISOString(),
    generator: {
      provider: input.generatedImage.provider,
      model: input.generatedImage.model,
      modelVersion: "unknown",
      runnerVersion: "0.1.2"
    },
    files: {
      image: input.imageRelativePath.replace(/\\/g, "/"),
      thumbnail: null
    },
    prompt: {
      positive: input.prompt.positivePrompt,
      negative: input.prompt.negativePrompt,
      rawCharacterCard: input.rawCharacterCardPath ?? null
    },
    parameters: {
      size: input.task.size,
      seed: input.generatedImage.seed ?? input.task.seed ?? null,
      promptExtend: input.task.promptExtend,
      watermark: input.task.watermark
    },
    source: {
      baseImageHash: null,
      referenceImages: []
    },
    review: createPendingReview()
  };
}

export async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
