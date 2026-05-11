import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defaultCharacterCard, createDefaultGenerationTask, ImageAssetManifestSchema } from "../schemas";
import { renderCharacter } from "../pipeline/render-task";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("render task", () => {
  it("renders mock PNGs and manifests", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "cal-render-"));
    tempDirs.push(outDir);

    const task = {
      ...createDefaultGenerationTask(defaultCharacterCard.id),
      size: "120*160",
      n: 2,
      seed: 10
    };

    const report = await renderCharacter({
      character: defaultCharacterCard,
      task,
      outDir
    });

    expect(report.status).toBe("success");
    expect(report.imageCount).toBe(2);
    await expect(stat(path.join(outDir, "images", "fox-merchant-base-standing-0001.png"))).resolves.toBeTruthy();
    await expect(stat(path.join(outDir, "task.json"))).resolves.toBeTruthy();

    const manifestRaw = await readFile(path.join(outDir, "manifests", "fox-merchant-base-standing-0001.json"), "utf8");
    const manifest = ImageAssetManifestSchema.parse(JSON.parse(manifestRaw));
    expect(manifest.files.image).toBe("images/fox-merchant-base-standing-0001.png");
  });

  it("writes a failed report when provider setup fails", async () => {
    const originalApiKey = process.env.DASHSCOPE_API_KEY;
    delete process.env.DASHSCOPE_API_KEY;
    const outDir = await mkdtemp(path.join(os.tmpdir(), "cal-render-"));
    tempDirs.push(outDir);
    const task = {
      ...createDefaultGenerationTask(defaultCharacterCard.id),
      provider: "dashscope-qwen" as const,
      model: "qwen-image-2.0-pro",
      n: 1
    };

    try {
      await expect(
        renderCharacter({
          character: defaultCharacterCard,
          task,
          outDir
        })
      ).rejects.toThrow();

      const reportRaw = await readFile(path.join(outDir, "report.json"), "utf8");
      const report = JSON.parse(reportRaw);
      expect(report.status).toBe("failed");
      expect(report.error.kind).toBe("missing_api_key");
    } finally {
      if (originalApiKey === undefined) {
        delete process.env.DASHSCOPE_API_KEY;
      } else {
        process.env.DASHSCOPE_API_KEY = originalApiKey;
      }
    }
  });
});
