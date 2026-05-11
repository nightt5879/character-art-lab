import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildImageAssetManifest, writeJsonFile } from "../assets/save-manifest";
import { buildPrompt } from "../prompt/prompt-builder";
import { updateManifestReview, readImageAssetManifest, summarizeManifest } from "../pipeline/manifest-review";
import { createDefaultGenerationTask, defaultCharacterCard } from "../schemas";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("manifest review", () => {
  it("summarizes and updates review status", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "cal-review-"));
    tempDirs.push(dir);
    const task = createDefaultGenerationTask(defaultCharacterCard.id);
    const manifest = buildImageAssetManifest({
      character: defaultCharacterCard,
      task,
      prompt: buildPrompt(defaultCharacterCard, task),
      generatedImage: {
        id: "fox-merchant-base-standing-0001",
        imagePath: "images/fox-merchant-base-standing-0001.png",
        provider: "mock",
        model: "mock-image"
      },
      imageRelativePath: "images/fox-merchant-base-standing-0001.png"
    });
    const manifestPath = path.join(dir, "manifest.json");
    await writeJsonFile(manifestPath, manifest);

    const summary = summarizeManifest(await readImageAssetManifest(manifestPath));
    expect(summary.reviewStatus).toBe("pending");

    const updated = await updateManifestReview(manifestPath, {
      status: "accepted",
      note: "Good base silhouette."
    });
    expect(updated.review.status).toBe("accepted");
    expect(updated.review.notes).toContain("Good base silhouette.");

    const raw = JSON.parse(await readFile(manifestPath, "utf8"));
    expect(raw.review.status).toBe("accepted");
  });
});
