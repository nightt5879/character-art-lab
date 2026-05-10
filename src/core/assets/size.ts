export interface ImageSize {
  width: number;
  height: number;
}

export function parseImageSize(size: string): ImageSize {
  const match = /^(\d{2,5})[*xX](\d{2,5})$/.exec(size.trim());
  if (!match) {
    throw new Error(`Invalid size "${size}". Use WIDTH*HEIGHT, for example 1104*1472.`);
  }

  return {
    width: Number(match[1]),
    height: Number(match[2])
  };
}
