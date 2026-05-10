#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { z } from "zod";
import {
  BatchFileSchema,
  CharacterCardSchema,
  createDefaultGenerationTask,
  GenerationTaskSchema,
  ImageAssetManifestSchema,
  PortraitSetSchema
} from "../src/core/schemas";
import { renderCharacter } from "../src/core/pipeline/render-task";

async function readJson(filePath: string): Promise<unknown> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function validateFile(label: string, schema: z.ZodTypeAny, filePath: string): Promise<void> {
  const value = await readJson(filePath);
  schema.parse(value);
  console.log(`ok ${label}: ${filePath}`);
}

function numberOption(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Expected an integer, received "${value}".`);
  }
  return parsed;
}

const program = new Command();

program
  .name("cal")
  .description("Character Art Lab CLI")
  .version("0.1.0");

program
  .command("validate")
  .description("Validate a character card, generation task, batch file, portrait set, or image manifest.")
  .option("--character <path>", "Character card JSON")
  .option("--task <path>", "Generation task JSON")
  .option("--batch <path>", "Batch file JSON")
  .option("--portrait-set <path>", "Portrait set JSON")
  .option("--manifest <path>", "Image asset manifest JSON")
  .action(async (options: Record<string, string | undefined>) => {
    const targets = [
      ["character", CharacterCardSchema, options.character],
      ["task", GenerationTaskSchema, options.task],
      ["batch", BatchFileSchema, options.batch],
      ["portrait-set", PortraitSetSchema, options.portraitSet],
      ["manifest", ImageAssetManifestSchema, options.manifest]
    ] as const;

    const selected = targets.filter((target) => target[2]);
    if (selected.length === 0) {
      throw new Error("Provide at least one file to validate.");
    }

    for (const [label, schema, filePath] of selected) {
      if (!filePath) {
        continue;
      }
      await validateFile(label, schema, filePath);
    }
  });

program
  .command("render")
  .description("Render one character with the selected provider.")
  .requiredOption("--character <path>", "Character card JSON")
  .option("--provider <provider>", "Image provider", "mock")
  .option("--model <model>", "Model id", "mock-image")
  .option("--size <size>", "Image size WIDTH*HEIGHT", "1104*1472")
  .option("--n <count>", "Number of images", numberOption, 4)
  .option("--seed <seed>", "Seed", numberOption)
  .option("--task-type <taskType>", "Generation task type", "base-standing")
  .option("--out-dir <path>", "Output directory", "out/render")
  .action(async (options) => {
    const characterPath = path.resolve(options.character);
    const character = CharacterCardSchema.parse(await readJson(characterPath));
    const baseTask = createDefaultGenerationTask(character.id);
    const task = GenerationTaskSchema.parse({
      ...baseTask,
      id: `${character.id}-${options.taskType}`,
      characterId: character.id,
      taskType: options.taskType,
      provider: options.provider,
      model: options.model,
      size: options.size,
      n: options.n,
      seed: options.seed
    });

    const report = await renderCharacter({
      character,
      task,
      outDir: path.resolve(options.outDir),
      rawCharacterCardPath: path.relative(path.resolve(options.outDir), characterPath).replace(/\\/g, "/")
    });

    console.log(`render ${report.status}: ${options.outDir}`);
    console.log(`images: ${report.imageCount}`);
  });

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`error: ${message}`);
  process.exitCode = 1;
});
