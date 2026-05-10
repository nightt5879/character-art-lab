import { z } from "zod";

const StringListSchema = z.array(z.string().min(1)).default([]);

export const CharacterCardSchema = z
  .object({
    schema: z.literal("character-art-lab/character-card"),
    schemaVersion: z.string().min(1).default("0.1"),
    id: z
      .string()
      .min(1)
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, "Use letters, numbers, underscores, or hyphens."),
    name: z.string().min(1),
    role: z.string().optional(),
    world: z.string().optional(),
    visual: z
      .object({
        genderPresentation: z.string().optional(),
        ageRange: z.string().optional(),
        bodyType: z.string().optional(),
        hair: z.string().optional(),
        eyes: z.string().optional(),
        signatureFeatures: StringListSchema.optional(),
        palette: StringListSchema.optional()
      })
      .default({}),
    outfit: z
      .object({
        base: z.string().optional(),
        materials: StringListSchema.optional(),
        accessories: StringListSchema.optional()
      })
      .optional(),
    style: z
      .object({
        renderStyle: z.string().optional(),
        lineStyle: z.string().optional(),
        lighting: z.string().optional(),
        background: z.string().optional()
      })
      .optional(),
    constraints: z
      .object({
        mustInclude: StringListSchema.optional(),
        avoid: StringListSchema.optional()
      })
      .optional()
  })
  .strict();

export type CharacterCard = z.infer<typeof CharacterCardSchema>;

export const defaultCharacterCard: CharacterCard = {
  schema: "character-art-lab/character-card",
  schemaVersion: "0.1",
  id: "fox-merchant",
  name: "Fox Merchant",
  role: "traveling merchant NPC",
  world: "cozy fantasy town",
  visual: {
    genderPresentation: "female",
    ageRange: "young adult",
    bodyType: "slender",
    hair: "long amber hair, soft curls",
    eyes: "golden fox-like eyes",
    signatureFeatures: ["fox ears", "small fang", "red ribbon", "merchant satchel"],
    palette: ["warm amber", "cream white", "muted red"]
  },
  outfit: {
    base: "cozy fantasy merchant outfit",
    materials: ["linen", "leather", "wool"],
    accessories: ["coin pouch", "small ledger"]
  },
  style: {
    renderStyle: "anime game character standing illustration",
    lineStyle: "clean line art",
    lighting: "soft studio lighting",
    background: "plain light background"
  },
  constraints: {
    mustInclude: ["full body", "front-facing", "feet visible", "clean silhouette"],
    avoid: ["extra fingers", "cropped feet", "busy background", "text", "watermark"]
  }
};
