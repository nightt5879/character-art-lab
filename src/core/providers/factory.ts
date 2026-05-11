import type { GenerationTask } from "../schemas";
import type { ImageProvider } from "./provider-capabilities";
import { DashScopeQwenProvider } from "./dashscope-qwen-provider";
import { MockProvider } from "./mock-provider";

export function createImageProvider(task: GenerationTask): ImageProvider {
  switch (task.provider) {
    case "mock":
      return new MockProvider();
    case "dashscope-qwen":
      return new DashScopeQwenProvider();
    default:
      throw new Error(`Provider "${task.provider}" is not implemented yet.`);
  }
}
