import { describe, expect, it } from "vitest";
import {
  BatchFileSchema,
  CharacterCardSchema,
  createDefaultGenerationTask,
  defaultCharacterCard,
  GenerationTaskSchema,
  ImageAssetManifestSchema
} from "../schemas";
import { buildImageAssetManifest } from "../assets/save-manifest";
import { buildPrompt } from "../prompt/prompt-builder";

describe("schemas", () => {
  it("validates the default character card", () => {
    expect(CharacterCardSchema.parse(defaultCharacterCard).id).toBe("fox-merchant");
  });

  it("validates a default generation task", () => {
    const task = createDefaultGenerationTask(defaultCharacterCard.id);
    expect(GenerationTaskSchema.parse(task).provider).toBe("mock");
  });

  it("validates a batch file", () => {
    const parsed = BatchFileSchema.parse({
      schema: "character-art-lab/batch",
      schemaVersion: "0.1",
      id: "sample",
      defaults: {
        provider: "mock",
        model: "mock-image",
        size: "1104*1472",
        n: 4,
        promptExtend: false,
        watermark: false
      },
      items: [
        {
          id: "fox-merchant-base",
          character: "examples/character-cards/fox-merchant.json",
          taskType: "base-standing"
        }
      ]
    });

    expect(parsed.items).toHaveLength(1);
  });

  it("validates an image asset manifest", () => {
    const task = createDefaultGenerationTask(defaultCharacterCard.id);
    const prompt = buildPrompt(defaultCharacterCard, task);
    const manifest = buildImageAssetManifest({
      character: defaultCharacterCard,
      task,
      prompt,
      generatedImage: {
        id: "fox-merchant-base-standing-0001",
        imagePath: "images/fox-merchant-base-standing-0001.png",
        provider: "mock",
        model: "mock-image",
        seed: 42
      },
      imageRelativePath: "images/fox-merchant-base-standing-0001.png"
    });

    expect(ImageAssetManifestSchema.parse(manifest).review.status).toBe("pending");
  });
});
