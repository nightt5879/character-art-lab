import { z } from "zod";
import { GenerationTaskTypeSchema } from "./generation-task";
import { ImageProviderKindSchema } from "./provider";

export const BatchFileSchema = z
  .object({
    schema: z.literal("character-art-lab/batch"),
    schemaVersion: z.string().min(1).default("0.1"),
    id: z.string().min(1),
    defaults: z
      .object({
        provider: ImageProviderKindSchema.default("mock"),
        model: z.string().min(1).default("mock-image"),
        size: z.string().regex(/^\d{2,5}[*xX]\d{2,5}$/),
        n: z.number().int().min(1).max(16).default(4),
        promptExtend: z.boolean().default(false),
        watermark: z.boolean().default(false)
      })
      .default({
        provider: "mock",
        model: "mock-image",
        size: "1104*1472",
        n: 4,
        promptExtend: false,
        watermark: false
      }),
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          character: z.string().min(1),
          taskType: GenerationTaskTypeSchema.default("base-standing")
        })
      )
      .min(1)
  })
  .strict();

export type BatchFile = z.infer<typeof BatchFileSchema>;
