import { describe, expect, it } from "vitest";
import { defaultCharacterCard, createDefaultGenerationTask } from "../schemas";
import { buildPrompt } from "../prompt/prompt-builder";

describe("prompt builder", () => {
  it("builds positive and negative prompts from a character card", () => {
    const prompt = buildPrompt(defaultCharacterCard, createDefaultGenerationTask(defaultCharacterCard.id));

    expect(prompt.positivePrompt).toContain("Fox Merchant");
    expect(prompt.positivePrompt).toContain("game dialogue portrait asset");
    expect(prompt.negativePrompt).toContain("watermark");
    expect(prompt.negativePrompt).toContain("extra fingers");
  });
});
