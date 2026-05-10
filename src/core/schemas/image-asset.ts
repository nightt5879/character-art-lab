import { z } from "zod";
import { ImageProviderKindSchema } from "./provider";

export const ReviewStatusSchema = z.enum(["pending", "accepted", "rejected", "needs_edit", "archived"]);

export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

const NullableScoreSchema = z.number().min(0).max(5).nullable();

export const ImageAssetManifestSchema = z
  .object({
    schema: z.literal("character-art-lab/image-asset"),
    schemaVersion: z.string().min(1).default("0.1"),
    assetId: z.string().min(1),
    characterId: z.string().min(1),
    taskId: z.string().min(1),
    createdAt: z.string().datetime(),
    generator: z.object({
      provider: ImageProviderKindSchema,
      model: z.string().min(1),
      modelVersion: z.string().default("unknown"),
      runnerVersion: z.string().default("0.1.0")
    }),
    files: z.object({
      image: z.string().min(1),
      thumbnail: z.string().min(1).nullable().default(null)
    }),
    prompt: z.object({
      positive: z.string().min(1),
      negative: z.string().default(""),
      rawCharacterCard: z.string().nullable().default(null)
    }),
    parameters: z.record(z.unknown()).default({}),
    source: z.object({
      baseImageHash: z.string().nullable().default(null),
      referenceImages: z.array(z.string()).default([])
    }),
    review: z.object({
      status: ReviewStatusSchema.default("pending"),
      scores: z.object({
        characterConsistency: NullableScoreSchema,
        gameUsability: NullableScoreSchema,
        hands: NullableScoreSchema,
        silhouette: NullableScoreSchema,
        outfitAccuracy: NullableScoreSchema
      }),
      notes: z.array(z.string()).default([])
    })
  })
  .strict();

export type ImageAssetManifest = z.infer<typeof ImageAssetManifestSchema>;

export function createPendingReview(): ImageAssetManifest["review"] {
  return {
    status: "pending",
    scores: {
      characterConsistency: null,
      gameUsability: null,
      hands: null,
      silhouette: null,
      outfitAccuracy: null
    },
    notes: []
  };
}
