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
});
