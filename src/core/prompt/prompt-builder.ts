import type { CharacterCard } from "../schemas/character-card";
import type { GenerationTask } from "../schemas/generation-task";

export interface BuiltPrompt {
  positivePrompt: string;
  negativePrompt: string;
  warnings: string[];
}

const BASE_NEGATIVE_TERMS = [
  "low quality",
  "blurry",
  "extra fingers",
  "missing fingers",
  "extra limbs",
  "cropped feet",
  "cropped head",
  "busy background",
  "text",
  "watermark",
  "logo",
  "duplicated character",
  "distorted face",
  "inconsistent eyes",
  "bad anatomy",
  "malformed hands"
];

function splitPromptTerms(value: string | undefined | null): string[] {
  return value
    ? value
        .split(",")
        .map((term) => term.trim())
        .filter(Boolean)
    : [];
}

function normalizeTerm(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function uniqueTerms(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  return values
    .flatMap(splitPromptTerms)
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = normalizeTerm(value);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function joinList(values: Array<string | undefined | null>): string {
  return uniqueTerms(values).join(", ");
}

function joinArray(values: string[] | undefined): string {
  return values?.map((value) => value.trim()).filter(Boolean).join(", ") ?? "";
}

function taskComposition(task: GenerationTask): string {
  switch (task.taskType) {
    case "half-body":
      return "half-body character portrait, upper body visible, dialogue portrait framing";
    case "bust":
      return "bust portrait, clear face, shoulders visible, dialogue UI friendly framing";
    case "expression-variant":
      return "same character identity, expression variant, face remains consistent";
    case "costume-variant":
      return "same character identity, alternate costume variant, clean silhouette";
    case "pose-variant":
      return "same character identity, alternate standing pose, full body visible";
    case "reference-sheet":
      return "character reference sheet, front-facing main view, clean readable design";
    case "npc-pack":
      return "NPC production art, consistent game portrait asset style";
    case "base-standing":
    default:
      return "centered composition, front-facing, full body visible, feet visible, clean silhouette";
  }
}

function isCoveredByComposition(term: string, composition: string): boolean {
  const normalizedTerm = normalizeTerm(term);
  const normalizedComposition = normalizeTerm(composition);
  if (normalizedComposition.includes(normalizedTerm)) {
    return true;
  }

  const semanticMatches: Record<string, string[]> = {
    "full body": ["full body visible", "full-body standing"],
    "front-facing": ["front-facing"],
    "feet visible": ["feet visible"],
    "clean silhouette": ["clean silhouette"]
  };
  return (semanticMatches[normalizedTerm] ?? []).some((match) => normalizedComposition.includes(match));
}

export function buildPrompt(character: CharacterCard, task: GenerationTask): BuiltPrompt {
  const visualFeatures = joinList([
    character.visual.genderPresentation,
    character.visual.ageRange,
    character.visual.bodyType,
    character.visual.hair,
    character.visual.eyes,
    joinArray(character.visual.signatureFeatures),
    joinArray(character.visual.palette)
  ]);

  const outfitDescription = joinList([
    character.outfit?.base,
    joinArray(character.outfit?.materials),
    joinArray(character.outfit?.accessories)
  ]);

  const styleDescription = joinList([
    character.style?.renderStyle,
    character.style?.lineStyle,
    character.style?.lighting,
    character.style?.background
  ]);

  const composition = taskComposition(task);
  const requiredComposition = joinArray(
    character.constraints?.mustInclude?.filter((term) => !isCoveredByComposition(term, composition))
  );
  const positiveParts = [
    `full-body standing character illustration of ${character.name}`,
    character.role,
    character.world ? `from ${character.world}` : undefined,
    "designed as a clean game dialogue portrait asset",
    composition,
    "full character visible with extra margin around head and feet",
    requiredComposition,
    visualFeatures,
    outfitDescription,
    styleDescription,
    "soft studio lighting",
    "clean line art",
    "high-quality game character art"
  ];

  const negativeTerms = [...BASE_NEGATIVE_TERMS, ...(character.constraints?.avoid ?? [])];
  const positivePrompt = joinList(positiveParts);
  const negativePrompt = uniqueTerms(negativeTerms).join(", ");
  const warnings: string[] = [];

  if (positivePrompt.length > 800) {
    warnings.push(`Positive prompt is ${positivePrompt.length} characters; DashScope Qwen Image documents an 800 character limit.`);
  }

  if (negativePrompt.length > 500) {
    warnings.push(`Negative prompt is ${negativePrompt.length} characters; DashScope Qwen Image documents a 500 character limit.`);
  }

  return {
    positivePrompt,
    negativePrompt,
    warnings
  };
}

export function formatPromptPreview(prompt: BuiltPrompt): string {
  return [
    `Positive:`,
    prompt.positivePrompt,
    ``,
    `Negative:`,
    prompt.negativePrompt,
    ...(prompt.warnings.length > 0 ? [``, `Warnings:`, ...prompt.warnings] : [])
  ].join("\n");
}
