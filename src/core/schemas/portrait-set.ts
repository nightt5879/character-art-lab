import { z } from "zod";

export const PortraitSetSchema = z
  .object({
    schema: z.literal("character-art-lab/portrait-set"),
    schemaVersion: z.string().min(1).default("0.1"),
    id: z.string().min(1),
    characterId: z.string().min(1),
    displayName: z.string().min(1),
    base: z.object({
      assetId: z.string().min(1),
      image: z.string().min(1)
    }),
    expressions: z.record(z.string().min(1)).default({}),
    costumes: z.record(z.string().min(1)).default({}),
    metadata: z.object({
      createdAt: z.string().datetime(),
      sourceTool: z.literal("character-art-lab"),
      sourceVersion: z.string().min(1)
    })
  })
  .strict();

export type PortraitSet = z.infer<typeof PortraitSetSchema>;
