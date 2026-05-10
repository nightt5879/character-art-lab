import { z } from "zod";

export const ImageProviderKindSchema = z.enum([
  "mock",
  "dashscope-qwen",
  "local-qwen",
  "local-zimage",
  "comfyui",
  "custom-http"
]);

export type ImageProviderKind = z.infer<typeof ImageProviderKindSchema>;

export const ImageProviderCapabilitiesSchema = z.object({
  textToImage: z.boolean(),
  imageToImage: z.boolean(),
  imageEdit: z.boolean(),
  multiReference: z.boolean(),
  negativePrompt: z.boolean(),
  seed: z.boolean(),
  batch: z.boolean(),
  maxImagesPerRequest: z.number().int().positive(),
  supportedSizes: z.array(z.string().min(1))
});

export type ImageProviderCapabilities = z.infer<typeof ImageProviderCapabilitiesSchema>;
