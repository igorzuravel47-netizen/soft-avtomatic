import type {
  CellColorAnalysis,
  ColorGroup,
  ColorStats,
  ColorThresholds
} from '../types/color.types';
import type { GridDefinition } from '../types/grid.types';
import { classifyColor, rgbToHsv, rgbaToHex } from '../utils/colorUtils';
import { getSafeCellRect } from '../utils/gridUtils';

export function dominantCellColor(
  imageData: ImageData,
  grid: GridDefinition,
  row: number,
  column: number
) {
  const rect = getSafeCellRect(grid, row, column, imageData.width, imageData.height);

  if (!rect) {
    return [0, 0, 0, 0] as [number, number, number, number];
  }

  const startX = Math.max(0, Math.floor(rect.x + 1));
  const startY = Math.max(0, Math.floor(rect.y + 1));
  const endX = Math.min(imageData.width, Math.ceil(rect.x + rect.width - 1));
  const endY = Math.min(imageData.height, Math.ceil(rect.y + rect.height - 1));
  const buckets = new Map<string, { rgba: [number, number, number, number]; count: number }>();

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * imageData.width + x) * 4;
      const a = imageData.data[index + 3];
      if (a === 0) {
        continue;
      }

      const rgba: [number, number, number, number] = [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
        a
      ];
      const key = rgbaToHex(rgba[0], rgba[1], rgba[2], rgba[3]);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.count += 1;
      } else {
        buckets.set(key, { rgba, count: 1 });
      }
    }
  }

  return (
    [...buckets.values()].sort((a, b) => b.count - a.count)[0]?.rgba ??
    ([0, 0, 0, 0] as [number, number, number, number])
  );
}

export function cellColorCoverage(
  imageData: ImageData,
  grid: GridDefinition,
  row: number,
  column: number,
  group: ColorGroup,
  thresholds: ColorThresholds
) {
  const rect = getSafeCellRect(grid, row, column, imageData.width, imageData.height);

  if (!rect) {
    return 0;
  }

  const insetX = Math.max(2, Math.floor(rect.width * 0.08));
  const insetY = Math.max(2, Math.floor(rect.height * 0.08));
  const startX = Math.max(0, Math.floor(rect.x + insetX));
  const startY = Math.max(0, Math.floor(rect.y + insetY));
  const endX = Math.min(imageData.width, Math.ceil(rect.x + rect.width - insetX));
  const endY = Math.min(imageData.height, Math.ceil(rect.y + rect.height - insetY));
  let matching = 0;
  let total = 0;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * imageData.width + x) * 4;
      const alpha = imageData.data[index + 3];
      if (alpha < 96) {
        continue;
      }

      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      // White text and very dark/low-saturation grid pixels should not decide cell color.
      if (max > 225 && max - min < 38) {
        continue;
      }

      total += 1;
      if (classifyColor(r, g, b, alpha, thresholds) === group) {
        matching += 1;
      }
    }
  }

  return total === 0 ? 0 : matching / total;
}

export function cellGroupCoverages(
  imageData: ImageData,
  grid: GridDefinition,
  row: number,
  column: number,
  thresholds: ColorThresholds
) {
  const rect = getSafeCellRect(grid, row, column, imageData.width, imageData.height);

  if (!rect) {
    return { blue: 0, red: 0, green: 0 };
  }

  const insetX = Math.max(2, Math.floor(rect.width * 0.08));
  const insetY = Math.max(2, Math.floor(rect.height * 0.08));
  const startX = Math.max(0, Math.floor(rect.x + insetX));
  const startY = Math.max(0, Math.floor(rect.y + insetY));
  const endX = Math.min(imageData.width, Math.ceil(rect.x + rect.width - insetX));
  const endY = Math.min(imageData.height, Math.ceil(rect.y + rect.height - insetY));
  const counts: Record<ColorGroup, number> = { blue: 0, red: 0, green: 0 };
  let total = 0;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * imageData.width + x) * 4;
      const alpha = imageData.data[index + 3];
      if (alpha < 96) {
        continue;
      }

      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      if (max > 225 && max - min < 38) {
        continue;
      }

      total += 1;
      const group = classifyColor(r, g, b, alpha, thresholds);
      if (group) {
        counts[group] += 1;
      }
    }
  }

  return {
    blue: total ? counts.blue / total : 0,
    red: total ? counts.red / total : 0,
    green: total ? counts.green / total : 0
  };
}

export function analyzeGridColors(
  imageData: ImageData,
  grid: GridDefinition,
  thresholds: ColorThresholds
): CellColorAnalysis[] {
  const result: CellColorAnalysis[] = [];

  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const rgba = dominantCellColor(imageData, grid, row, column);
      result.push({
        row,
        column,
        rgba,
        hex: rgbaToHex(rgba[0], rgba[1], rgba[2], rgba[3]),
        hsv: rgbToHsv(rgba[0], rgba[1], rgba[2]),
        group: classifyColor(rgba[0], rgba[1], rgba[2], rgba[3], thresholds)
      });
    }
  }

  return result;
}

export function getColorStats(cells: CellColorAnalysis[]): ColorStats {
  return cells.reduce<ColorStats>(
    (stats, cell) => {
      if (cell.group) {
        stats[cell.group] += 1;
      } else {
        stats.other += 1;
      }
      return stats;
    },
    { blue: 0, red: 0, green: 0, other: 0 }
  );
}

export function applyColorIsolation(
  imageData: ImageData,
  grid: GridDefinition,
  cells: CellColorAnalysis[],
  group: ColorGroup
): ImageData {
  const output = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  const keep = new Set(
    cells.filter((cell) => cell.group === group).map((cell) => `${cell.row}:${cell.column}`)
  );

  for (const cell of cells) {
    if (keep.has(`${cell.row}:${cell.column}`)) {
      continue;
    }

    clearCellInterior(output, grid, cell.row, cell.column);
  }

  return output;
}

export function removeColorGroup(
  imageData: ImageData,
  grid: GridDefinition,
  cells: CellColorAnalysis[],
  group: ColorGroup
): ImageData {
  const output = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  cells
    .filter((cell) => cell.group === group)
    .forEach((cell) => clearCellInterior(output, grid, cell.row, cell.column));
  return output;
}

export function clearCellInterior(
  imageData: ImageData,
  grid: GridDefinition,
  row: number,
  column: number
): void {
  const rect = getSafeCellRect(grid, row, column, imageData.width, imageData.height);

  if (!rect) {
    return;
  }

  const startX = Math.max(0, Math.floor(rect.x + 1));
  const startY = Math.max(0, Math.floor(rect.y + 1));
  const endX = Math.min(imageData.width, Math.ceil(rect.x + rect.width - 1));
  const endY = Math.min(imageData.height, Math.ceil(rect.y + rect.height - 1));

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      imageData.data[(y * imageData.width + x) * 4 + 3] = 0;
    }
  }
}
