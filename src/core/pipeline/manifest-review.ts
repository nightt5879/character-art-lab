import { readFile } from "node:fs/promises";
import { ImageAssetManifestSchema, ReviewStatusSchema, type ImageAssetManifest, type ReviewStatus } from "../schemas";
import { writeJsonFile } from "../assets/save-manifest";

export interface ManifestSummary {
  assetId: string;
  characterId: string;
  taskId: string;
  provider: string;
  model: string;
  image: string;
  reviewStatus: ReviewStatus;
  createdAt: string;
  positivePrompt: string;
  negativePrompt: string;
}

export async function readImageAssetManifest(filePath: string): Promise<ImageAssetManifest> {
  const raw = await readFile(filePath, "utf8");
  return ImageAssetManifestSchema.parse(JSON.parse(raw));
}

export function summarizeManifest(manifest: ImageAssetManifest): ManifestSummary {
  return {
    assetId: manifest.assetId,
    characterId: manifest.characterId,
    taskId: manifest.taskId,
    provider: manifest.generator.provider,
    model: manifest.generator.model,
    image: manifest.files.image,
    reviewStatus: manifest.review.status,
    createdAt: manifest.createdAt,
    positivePrompt: manifest.prompt.positive,
    negativePrompt: manifest.prompt.negative
  };
}

export async function updateManifestReview(
  filePath: string,
  update: { status: ReviewStatus; note?: string }
): Promise<ImageAssetManifest> {
  const manifest = await readImageAssetManifest(filePath);
  const nextNotes = update.note ? [...manifest.review.notes, update.note] : manifest.review.notes;
  const nextManifest: ImageAssetManifest = {
    ...manifest,
    review: {
      ...manifest.review,
      status: ReviewStatusSchema.parse(update.status),
      notes: nextNotes
    }
  };

  await writeJsonFile(filePath, nextManifest);
  return nextManifest;
}
