import type { CharacterCard, ImageProviderCapabilities, ImageProviderKind } from "../schemas";

export interface GenerateImageRequest {
  taskId: string;
  prompt: string;
  negativePrompt?: string;
  size: string;
  n: number;
  seed?: number;
  model: string;
  characterCard?: CharacterCard;
  referenceImages?: string[];
  metadata?: Record<string, unknown>;
}

export interface GeneratedImage {
  id: string;
  imagePath: string;
  width?: number;
  height?: number;
  provider: ImageProviderKind;
  model: string;
  seed?: number;
  rawResponse?: unknown;
}

export interface ImageProvider {
  id: ImageProviderKind;
  name: string;
  getCapabilities(): ImageProviderCapabilities;
  generate(request: GenerateImageRequest): Promise<GeneratedImage[]>;
  edit?(request: GenerateImageRequest): Promise<GeneratedImage[]>;
}
