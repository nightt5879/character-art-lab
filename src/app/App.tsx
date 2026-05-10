import { useMemo, useState } from "react";
import { Download, FileJson, ImagePlus, RefreshCw } from "lucide-react";
import {
  CharacterCardSchema,
  createDefaultGenerationTask,
  defaultCharacterCard,
  GenerationTaskSchema,
  type CharacterCard,
  type GenerationTask,
  type GenerationTaskType
} from "../core/schemas";
import { buildPrompt, formatPromptPreview } from "../core/prompt/prompt-builder";
import { parseImageSize } from "../core/assets/size";

interface MockGalleryItem {
  id: string;
  imageUrl: string;
  manifest: unknown;
}

const TASK_TYPES: GenerationTaskType[] = [
  "base-standing",
  "half-body",
  "bust",
  "expression-variant",
  "costume-variant",
  "pose-variant",
  "reference-sheet",
  "npc-pack"
];

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(values: string[] | undefined): string {
  return values?.join("\n") ?? "";
}

function downloadJson(fileName: string, value: unknown): void {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(href);
}

function mockSvgDataUrl(card: CharacterCard, task: GenerationTask, index: number): string {
  const { width, height } = parseImageSize(task.size);
  const hue = (card.id.length * 41 + index * 37) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f7f3ea"/>
          <stop offset="100%" stop-color="#e7edf2"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <g opacity="0.35" stroke="#76818f" stroke-width="2">
        <path d="M0 ${height * 0.72} H${width}"/>
        <path d="M${width * 0.22} 0 V${height}"/>
        <path d="M${width * 0.78} 0 V${height}"/>
      </g>
      <circle cx="${width / 2}" cy="${height * 0.24}" r="${Math.min(width, height) * 0.08}" fill="hsl(${hue} 48% 52%)"/>
      <path d="M${width * 0.35} ${height * 0.38} L${width * 0.65} ${height * 0.38} L${width * 0.57} ${height * 0.78} L${width * 0.43} ${height * 0.78} Z" fill="#26323d"/>
      <path d="M${width * 0.34} ${height * 0.86} H${width * 0.66}" stroke="hsl(${hue} 48% 52%)" stroke-width="${Math.max(6, width * 0.012)}" stroke-linecap="round"/>
      <text x="50%" y="${height * 0.93}" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${Math.max(24, width * 0.045)}" fill="#2f3b45">${card.name} ${index + 1}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeBrowserManifest(card: CharacterCard, task: GenerationTask, index: number, prompt: ReturnType<typeof buildPrompt>) {
  const sequence = String(index + 1).padStart(4, "0");
  const assetId = `${task.id}-${sequence}`;
  return {
    schema: "character-art-lab/image-asset",
    schemaVersion: "0.1",
    assetId,
    characterId: card.id,
    taskId: task.id,
    createdAt: new Date().toISOString(),
    generator: {
      provider: "mock",
      model: task.model,
      modelVersion: "browser-preview",
      runnerVersion: "0.1.0"
    },
    files: {
      image: `images/${assetId}.png`,
      thumbnail: null
    },
    prompt: {
      positive: prompt.positivePrompt,
      negative: prompt.negativePrompt,
      rawCharacterCard: null
    },
    parameters: {
      size: task.size,
      seed: task.seed ?? null,
      promptExtend: task.promptExtend,
      watermark: task.watermark
    },
    source: {
      baseImageHash: null,
      referenceImages: []
    },
    review: {
      status: "pending",
      scores: {
        characterConsistency: null,
        gameUsability: null,
        hands: null,
        silhouette: null,
        outfitAccuracy: null
      },
      notes: []
    }
  };
}

export function App() {
  const [card, setCard] = useState<CharacterCard>(defaultCharacterCard);
  const [task, setTask] = useState<GenerationTask>(() => createDefaultGenerationTask(defaultCharacterCard.id));
  const [gallery, setGallery] = useState<MockGalleryItem[]>([]);

  const parsedCard = CharacterCardSchema.safeParse(card);
  const normalizedTask = {
    ...task,
    id: `${card.id}-${task.taskType}`,
    characterId: card.id,
    provider: "mock" as const,
    model: task.model || "mock-image"
  };
  const parsedTask = GenerationTaskSchema.safeParse(normalizedTask);
  const prompt = parsedCard.success && parsedTask.success ? buildPrompt(parsedCard.data, parsedTask.data) : null;

  const manifestPreview = useMemo(() => {
    if (!prompt || !parsedCard.success || !parsedTask.success) {
      return "";
    }
    return JSON.stringify(makeBrowserManifest(parsedCard.data, parsedTask.data, 0, prompt), null, 2);
  }, [parsedCard, parsedTask, prompt]);

  function updateCard(update: (current: CharacterCard) => CharacterCard): void {
    setCard((current) => update({ ...current }));
  }

  function updateTask(update: (current: GenerationTask) => GenerationTask): void {
    setTask((current) => update({ ...current }));
  }

  function generateMockGallery(): void {
    if (!prompt || !parsedCard.success || !parsedTask.success) {
      setGallery([]);
      return;
    }

    setGallery(
      Array.from({ length: parsedTask.data.n }, (_, index) => {
        const sequence = String(index + 1).padStart(4, "0");
        return {
          id: `${parsedTask.data.id}-${sequence}`,
          imageUrl: mockSvgDataUrl(parsedCard.data, parsedTask.data, index),
          manifest: makeBrowserManifest(parsedCard.data, parsedTask.data, index, prompt)
        };
      })
    );
  }

  return (
    <main className="workspace">
      <header className="topbar">
        <div>
          <h1>Character Art Lab</h1>
          <p>Protocol MVP</p>
        </div>
        <div className="topbar-actions">
          <button title="Export character card" onClick={() => downloadJson(`${card.id || "character-card"}.json`, card)}>
            <FileJson size={18} />
            Character
          </button>
          <button title="Export generation task" onClick={() => downloadJson(`${normalizedTask.id || "generation-task"}.json`, normalizedTask)}>
            <Download size={18} />
            Task
          </button>
        </div>
      </header>

      <section className="layout">
        <section className="panel editor-panel">
          <div className="panel-heading">
            <h2>Character Card</h2>
            <button title="Reset sample" className="icon-button" onClick={() => setCard(defaultCharacterCard)}>
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="field-grid two">
            <label>
              ID
              <input value={card.id} onChange={(event) => updateCard((current) => ({ ...current, id: event.target.value }))} />
            </label>
            <label>
              Name
              <input value={card.name} onChange={(event) => updateCard((current) => ({ ...current, name: event.target.value }))} />
            </label>
          </div>

          <label>
            Role
            <input value={card.role ?? ""} onChange={(event) => updateCard((current) => ({ ...current, role: event.target.value }))} />
          </label>

          <label>
            World
            <input value={card.world ?? ""} onChange={(event) => updateCard((current) => ({ ...current, world: event.target.value }))} />
          </label>

          <div className="field-grid two">
            <label>
              Hair
              <input
                value={card.visual.hair ?? ""}
                onChange={(event) => updateCard((current) => ({ ...current, visual: { ...current.visual, hair: event.target.value } }))}
              />
            </label>
            <label>
              Eyes
              <input
                value={card.visual.eyes ?? ""}
                onChange={(event) => updateCard((current) => ({ ...current, visual: { ...current.visual, eyes: event.target.value } }))}
              />
            </label>
          </div>

          <div className="field-grid two">
            <label>
              Signature Features
              <textarea
                value={listToLines(card.visual.signatureFeatures)}
                onChange={(event) =>
                  updateCard((current) => ({
                    ...current,
                    visual: { ...current.visual, signatureFeatures: linesToList(event.target.value) }
                  }))
                }
              />
            </label>
            <label>
              Palette
              <textarea
                value={listToLines(card.visual.palette)}
                onChange={(event) =>
                  updateCard((current) => ({
                    ...current,
                    visual: { ...current.visual, palette: linesToList(event.target.value) }
                  }))
                }
              />
            </label>
          </div>

          <label>
            Outfit
            <input
              value={card.outfit?.base ?? ""}
              onChange={(event) =>
                updateCard((current) => ({
                  ...current,
                  outfit: { ...current.outfit, base: event.target.value }
                }))
              }
            />
          </label>

          <div className="field-grid two">
            <label>
              Materials
              <textarea
                value={listToLines(card.outfit?.materials)}
                onChange={(event) =>
                  updateCard((current) => ({
                    ...current,
                    outfit: { ...current.outfit, materials: linesToList(event.target.value) }
                  }))
                }
              />
            </label>
            <label>
              Avoid
              <textarea
                value={listToLines(card.constraints?.avoid)}
                onChange={(event) =>
                  updateCard((current) => ({
                    ...current,
                    constraints: { ...current.constraints, avoid: linesToList(event.target.value) }
                  }))
                }
              />
            </label>
          </div>
        </section>

        <section className="panel task-panel">
          <div className="panel-heading">
            <h2>Task</h2>
            <button title="Mock generate" onClick={generateMockGallery}>
              <ImagePlus size={18} />
              Generate
            </button>
          </div>

          <div className="field-grid two compact">
            <label>
              Type
              <select
                value={task.taskType}
                onChange={(event) => updateTask((current) => ({ ...current, taskType: event.target.value as GenerationTaskType }))}
              >
                {TASK_TYPES.map((taskType) => (
                  <option key={taskType} value={taskType}>
                    {taskType}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Size
              <input value={task.size} onChange={(event) => updateTask((current) => ({ ...current, size: event.target.value }))} />
            </label>
            <label>
              Count
              <input
                type="number"
                min={1}
                max={16}
                value={task.n}
                onChange={(event) => updateTask((current) => ({ ...current, n: Number(event.target.value) }))}
              />
            </label>
            <label>
              Seed
              <input
                type="number"
                value={task.seed ?? ""}
                onChange={(event) =>
                  updateTask((current) => ({
                    ...current,
                    seed: event.target.value === "" ? undefined : Number(event.target.value)
                  }))
                }
              />
            </label>
          </div>

          <label>
            Model
            <input value={task.model} onChange={(event) => updateTask((current) => ({ ...current, model: event.target.value }))} />
          </label>

          <label>
            Prompt Preview
            <textarea className="prompt-preview" readOnly value={prompt ? formatPromptPreview(prompt) : ""} />
          </label>

          <label>
            Manifest Preview
            <textarea className="manifest-preview" readOnly value={manifestPreview} />
          </label>

          {(!parsedCard.success || !parsedTask.success) && (
            <pre className="validation-errors">
              {[
                ...(!parsedCard.success ? parsedCard.error.issues.map((issue) => `card.${issue.path.join(".")}: ${issue.message}`) : []),
                ...(!parsedTask.success ? parsedTask.error.issues.map((issue) => `task.${issue.path.join(".")}: ${issue.message}`) : [])
              ].join("\n")}
            </pre>
          )}
        </section>

        <section className="panel gallery-panel">
          <div className="panel-heading">
            <h2>Mock Gallery</h2>
            <span>{gallery.length}</span>
          </div>
          <div className="gallery-grid">
            {gallery.map((item) => (
              <article className="asset-tile" key={item.id}>
                <img src={item.imageUrl} alt={item.id} />
                <div>
                  <strong>{item.id}</strong>
                  <button title="Export manifest" onClick={() => downloadJson(`${item.id}.json`, item.manifest)}>
                    <FileJson size={16} />
                    Manifest
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
