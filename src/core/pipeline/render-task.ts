import path from "node:path";
import type { CharacterCard, GenerationTask, ImageAssetManifest } from "../schemas";
import { buildPrompt } from "../prompt/prompt-builder";
import { buildImageAssetManifest, writeJsonFile } from "../assets/save-manifest";
import { MockProvider } from "../providers/mock-provider";
import type { ImageProvider } from "../providers/provider-capabilities";
import { normalizeProviderError } from "../providers/provider-errors";

export interface RenderCharacterInput {
  character: CharacterCard;
  task: GenerationTask;
  outDir: string;
  rawCharacterCardPath?: string;
}

export interface RenderReport {
  schema: "character-art-lab/render-report";
  schemaVersion: "0.1";
  taskId: string;
  characterId: string;
  provider: string;
  model: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  status: "success" | "failed";
  imageCount: number;
  manifests: string[];
  error?: unknown;
}

function providerFor(task: GenerationTask): ImageProvider {
  switch (task.provider) {
    case "mock":
      return new MockProvider();
    default:
      throw new Error(`Provider "${task.provider}" is not implemented in v0.1. Use --provider mock.`);
  }
}

function toRelativeOutputPath(outDir: string, absoluteFilePath: string): string {
  return path.relative(outDir, absoluteFilePath).replace(/\\/g, "/");
}

export async function renderCharacter(input: RenderCharacterInput): Promise<RenderReport> {
  const startedAt = new Date();
  const prompt = buildPrompt(input.character, input.task);
  const provider = providerFor(input.task);

  await writeJsonFile(path.join(input.outDir, "character-card.json"), input.character);
  await writeJsonFile(path.join(input.outDir, "task.json"), input.task);

  try {
    const generatedImages = await provider.generate({
      taskId: input.task.id,
      prompt: prompt.positivePrompt,
      negativePrompt: prompt.negativePrompt,
      size: input.task.size,
      n: input.task.n,
      seed: input.task.seed,
      model: input.task.model,
      characterCard: input.character,
      metadata: {
        outputDir: input.outDir
      }
    });

    const manifests: ImageAssetManifest[] = generatedImages.map((generatedImage) =>
      buildImageAssetManifest({
        character: input.character,
        task: input.task,
        prompt,
        generatedImage,
        imageRelativePath: toRelativeOutputPath(input.outDir, generatedImage.imagePath),
        rawCharacterCardPath: input.rawCharacterCardPath
      })
    );

    const manifestPaths: string[] = [];
    for (const manifest of manifests) {
      const manifestPath = path.join(input.outDir, "manifests", `${manifest.assetId}.json`);
      await writeJsonFile(manifestPath, manifest);
      manifestPaths.push(toRelativeOutputPath(input.outDir, manifestPath));
    }

    const finishedAt = new Date();
    const report: RenderReport = {
      schema: "character-art-lab/render-report",
      schemaVersion: "0.1",
      taskId: input.task.id,
      characterId: input.character.id,
      provider: input.task.provider,
      model: input.task.model,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      status: "success",
      imageCount: generatedImages.length,
      manifests: manifestPaths
    };
    await writeJsonFile(path.join(input.outDir, "report.json"), report);
    return report;
  } catch (error) {
    const normalizedError = normalizeProviderError(error, {
      provider: input.task.provider,
      model: input.task.model
    });
    const finishedAt = new Date();
    const report: RenderReport = {
      schema: "character-art-lab/render-report",
      schemaVersion: "0.1",
      taskId: input.task.id,
      characterId: input.character.id,
      provider: input.task.provider,
      model: input.task.model,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      status: "failed",
      imageCount: 0,
      manifests: [],
      error: normalizedError
    };
    await writeJsonFile(path.join(input.outDir, "report.json"), report);
    throw error;
  }
}
