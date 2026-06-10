import type { Bounds } from '../types/image.types';
import { createCanvas, get2dContext } from '../utils/canvasUtils';
import { rgbToHsv } from '../utils/colorUtils';

export function findContentBounds(imageData: ImageData, alphaThreshold = 0): Bounds | null {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function boundsFromExtents(minX: number, minY: number, maxX: number, maxY: number): Bounds | null {
  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function isBrightBlueGridPixel(data: Uint8ClampedArray, index: number): boolean {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];

  if (a < 180) {
    return false;
  }

  const hsv = rgbToHsv(r, g, b);
  return hsv.h >= 185 && hsv.h <= 220 && hsv.s >= 0.35 && hsv.v >= 0.45 && b > r + 28;
}

function isChartCellPixel(data: Uint8ClampedArray, index: number): boolean {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];

  if (a < 180) {
    return false;
  }

  const hsv = rgbToHsv(r, g, b);
  return hsv.s >= 0.22 && hsv.v >= 0.28 && Math.max(r, g, b) - Math.min(r, g, b) >= 24;
}

function largestDenseRun(scores: number[], minScore: number, maxGap: number): { start: number; end: number } | null {
  let best: { start: number; end: number } | null = null;
  let bestArea = -1;
  let start = -1;
  let lastHit = -1;
  let area = 0;

  scores.forEach((score, index) => {
    if (score >= minScore) {
      if (start === -1) {
        start = index;
        area = 0;
      }
      lastHit = index;
      area += score;
      return;
    }

    if (start !== -1 && index - lastHit > maxGap) {
      if (area > bestArea) {
        best = { start, end: lastHit };
        bestArea = area;
      }
      start = -1;
      lastHit = -1;
      area = 0;
    }
  });

  if (start !== -1 && area > bestArea) {
    best = { start, end: lastHit };
  }

  return best;
}

export function findChartCellBounds(imageData: ImageData): Bounds | null {
  const { data, width, height } = imageData;
  const columns = new Array<number>(width).fill(0);
  const rows = new Array<number>(height).fill(0);
  let coloredPixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (isChartCellPixel(data, index)) {
        columns[x] += 1;
        rows[y] += 1;
        coloredPixels += 1;
      }
    }
  }

  if (coloredPixels < Math.max(64, Math.floor((width * height) / 500))) {
    return null;
  }

  const xRun = largestDenseRun(columns, Math.max(3, Math.floor(height * 0.04)), 4);
  const yRun = largestDenseRun(rows, Math.max(3, Math.floor(width * 0.04)), 4);

  if (!xRun || !yRun) {
    return null;
  }

  return boundsFromExtents(xRun.start, yRun.start, xRun.end, yRun.end);
}

export function findBlueGridBounds(imageData: ImageData): Bounds | null {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let count = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (isBrightBlueGridPixel(data, index)) {
        count += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const minPixelsForGrid = Math.max(20, Math.floor(Math.min(width, height) * 0.05));
  return count >= minPixelsForGrid ? boundsFromExtents(minX, minY, maxX, maxY) : null;
}

export function cropImageData(imageData: ImageData, bounds: Bounds): ImageData {
  const canvas = createCanvas(imageData.width, imageData.height);
  const context = get2dContext(canvas);
  context.putImageData(imageData, 0, 0);
  return context.getImageData(bounds.minX, bounds.minY, bounds.width, bounds.height);
}

export function autoTrim(imageData: ImageData): { imageData: ImageData; bounds: Bounds } {
  const bounds =
    findChartCellBounds(imageData) ??
    findBlueGridBounds(imageData) ??
    findContentBounds(imageData) ?? {
      minX: 0,
      minY: 0,
      maxX: imageData.width - 1,
      maxY: imageData.height - 1,
      width: imageData.width,
      height: imageData.height
    };

  return {
    imageData: cropImageData(imageData, bounds),
    bounds
  };
}
