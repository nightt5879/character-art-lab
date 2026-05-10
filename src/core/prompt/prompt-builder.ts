import type { CharacterCard } from "../schemas/character-card";
import type { GenerationTask } from "../schemas/generation-task";

export interface BuiltPrompt {
  positivePrompt: string;
  negativePrompt: string;
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

function joinList(values: Array<string | undefined | null>): string {
  return values
    .flatMap((value) => (value ? [value] : []))
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
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

  const requiredComposition = joinArray(character.constraints?.mustInclude);
  const positiveParts = [
    `full-body standing character illustration of ${character.name}`,
    character.role,
    character.world ? `from ${character.world}` : undefined,
    "designed as a clean game dialogue portrait asset",
    taskComposition(task),
    requiredComposition,
    visualFeatures,
    outfitDescription,
    styleDescription,
    "soft studio lighting",
    "clean line art",
    "high-quality game character art"
  ];

  const negativeTerms = [...BASE_NEGATIVE_TERMS, ...(character.constraints?.avoid ?? [])];

  return {
    positivePrompt: joinList(positiveParts),
    negativePrompt: Array.from(new Set(negativeTerms.map((term) => term.trim()).filter(Boolean))).join(", ")
  };
}

export function formatPromptPreview(prompt: BuiltPrompt): string {
  return [`Positive:`, prompt.positivePrompt, ``, `Negative:`, prompt.negativePrompt].join("\n");
}
