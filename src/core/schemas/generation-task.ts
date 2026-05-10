import { z } from "zod";
import { ImageProviderKindSchema } from "./provider";

export const GenerationTaskTypeSchema = z.enum([
  "base-standing",
  "half-body",
  "bust",
  "expression-variant",
  "costume-variant",
  "pose-variant",
  "reference-sheet",
  "npc-pack"
]);

export type GenerationTaskType = z.infer<typeof GenerationTaskTypeSchema>;

export const GenerationTaskSchema = z
  .object({
    schema: z.literal("character-art-lab/generation-task"),
    schemaVersion: z.string().min(1).default("0.1"),
    id: z.string().min(1),
    characterId: z.string().min(1),
    taskType: GenerationTaskTypeSchema.default("base-standing"),
    provider: ImageProviderKindSchema.default("mock"),
    model: z.string().min(1).default("mock-image"),
    size: z.string().regex(/^\d{2,5}[*xX]\d{2,5}$/, "Use WIDTH*HEIGHT, for example 1104*1472."),
    n: z.number().int().min(1).max(16).default(4),
    seed: z.number().int().optional(),
    promptMode: z.enum(["structured", "raw"]).default("structured"),
    promptExtend: z.boolean().default(false),
    watermark: z.boolean().default(false),
    output: z
      .object({
        format: z.enum(["png"]).default("png"),
        saveMetadata: z.boolean().default(true),
        makeThumbnail: z.boolean().default(false)
      })
      .default({
        format: "png",
        saveMetadata: true,
        makeThumbnail: false
      })
  })
  .strict();

export type GenerationTask = z.infer<typeof GenerationTaskSchema>;

export function createDefaultGenerationTask(characterId: string): GenerationTask {
  return {
    schema: "character-art-lab/generation-task",
    schemaVersion: "0.1",
    id: `${characterId}-base-standing`,
    characterId,
    taskType: "base-standing",
    provider: "mock",
    model: "mock-image",
    size: "1104*1472",
    n: 4,
    promptMode: "structured",
    promptExtend: false,
    watermark: false,
    output: {
      format: "png",
      saveMetadata: true,
      makeThumbnail: false
    }
  };
}
