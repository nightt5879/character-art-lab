import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";
import { parseImageSize } from "./size";

export interface PlaceholderPngOptions {
  size: string;
  outputPath: string;
  seed?: number;
}

function writePixel(png: PNG, x: number, y: number, color: [number, number, number, number]): void {
  const idx = (png.width * y + x) << 2;
  png.data[idx] = color[0];
  png.data[idx + 1] = color[1];
  png.data[idx + 2] = color[2];
  png.data[idx + 3] = color[3];
}

function seededHue(seed: number): number {
  return Math.abs(Math.sin(seed || 1) * 360) % 360;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export async function writePlaceholderPng(options: PlaceholderPngOptions): Promise<{ width: number; height: number }> {
  const { width, height } = parseImageSize(options.size);
  const png = new PNG({ width, height });
  const hue = seededHue(options.seed ?? width + height);
  const accent = hslToRgb(hue, 0.5, 0.52);
  const ink = hslToRgb((hue + 180) % 360, 0.34, 0.22);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const t = y / Math.max(1, height - 1);
      const grid = x % 96 < 2 || y % 96 < 2 ? 10 : 0;
      const base = Math.round(244 - t * 18 - grid);
      writePixel(png, x, y, [base, base + 2, base + 3, 255]);
    }
  }

  const centerX = Math.round(width / 2);
  const headRadius = Math.max(34, Math.round(Math.min(width, height) * 0.075));
  const headY = Math.round(height * 0.22);
  const bodyTop = headY + headRadius + Math.round(height * 0.035);
  const bodyBottom = Math.round(height * 0.78);
  const shoulderHalf = Math.round(width * 0.18);
  const waistHalf = Math.round(width * 0.105);

  for (let y = headY - headRadius; y <= headY + headRadius; y += 1) {
    for (let x = centerX - headRadius; x <= centerX + headRadius; x += 1) {
      const dx = x - centerX;
      const dy = y - headY;
      if (x >= 0 && y >= 0 && x < width && y < height && dx * dx + dy * dy <= headRadius * headRadius) {
        writePixel(png, x, y, [accent[0], accent[1], accent[2], 255]);
      }
    }
  }

  for (let y = bodyTop; y <= bodyBottom; y += 1) {
    const ratio = (y - bodyTop) / Math.max(1, bodyBottom - bodyTop);
    const halfWidth = Math.round(shoulderHalf * (1 - ratio) + waistHalf * ratio);
    for (let x = centerX - halfWidth; x <= centerX + halfWidth; x += 1) {
      if (x >= 0 && y >= 0 && x < width && y < height) {
        writePixel(png, x, y, [ink[0], ink[1], ink[2], 255]);
      }
    }
  }

  const floorY = Math.round(height * 0.86);
  for (let y = floorY; y < Math.min(height, floorY + 8); y += 1) {
    for (let x = Math.round(width * 0.2); x < Math.round(width * 0.8); x += 1) {
      writePixel(png, x, y, [accent[0], accent[1], accent[2], 255]);
    }
  }

  await mkdir(path.dirname(options.outputPath), { recursive: true });
  await writeFile(options.outputPath, PNG.sync.write(png));

  return { width, height };
}
