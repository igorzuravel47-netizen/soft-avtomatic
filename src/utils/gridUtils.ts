import type { CellCoordinate, GridDefinition } from '../types/grid.types';

export interface CellRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizedGridExtent(
  start: number,
  size: number,
  imageSize: number
): { start: number; end: number; size: number } {
  const safeImageSize = Math.max(0, imageSize);
  const safeStart = clamp(Number.isFinite(start) ? start : 0, 0, safeImageSize);
  const requestedEnd = safeStart + Math.max(0, Number.isFinite(size) ? size : 0);
  const safeEnd = clamp(requestedEnd, safeStart, safeImageSize);

  return {
    start: safeStart,
    end: safeEnd,
    size: safeEnd - safeStart
  };
}

function snapExtentToImage(
  extent: { start: number; end: number; size: number },
  imageSize: number,
  tolerance: number
): { start: number; end: number; size: number } {
  const start = extent.start <= tolerance ? 0 : extent.start;
  const end = imageSize - extent.end <= tolerance ? imageSize : extent.end;

  return {
    start,
    end,
    size: Math.max(0, end - start)
  };
}

export function cellId(row: number, column: number): string {
  return `${row}:${column}`;
}

export function gridColumnLinePosition(grid: GridDefinition, column: number): number {
  const safeColumn = clamp(column, 0, grid.columns);
  return grid.bounds.x + (grid.bounds.width * safeColumn) / grid.columns;
}

export function gridRowLinePosition(grid: GridDefinition, row: number): number {
  const safeRow = clamp(row, 0, grid.rows);
  return grid.bounds.y + (grid.bounds.height * safeRow) / grid.rows;
}

export function cellFromPoint(grid: GridDefinition, x: number, y: number): CellCoordinate | null {
  const left = grid.bounds.x;
  const top = grid.bounds.y;
  const right = grid.bounds.x + grid.bounds.width;
  const bottom = grid.bounds.y + grid.bounds.height;

  if (x < left || y < top || x >= right || y >= bottom) {
    return null;
  }

  const column = clamp(
    Math.floor(((x - left) / Math.max(1, right - left)) * grid.columns),
    0,
    grid.columns - 1
  );
  const row = clamp(
    Math.floor(((y - top) / Math.max(1, bottom - top)) * grid.rows),
    0,
    grid.rows - 1
  );

  return { row, column };
}

export function getSafeCellRect(
  grid: GridDefinition,
  row: number,
  column: number,
  imageWidth: number,
  imageHeight: number
): CellRect | null {
  if (
    row < 0 ||
    column < 0 ||
    row >= grid.rows ||
    column >= grid.columns ||
    grid.rows <= 0 ||
    grid.columns <= 0
  ) {
    return null;
  }

  const safeImageWidth = Math.max(1, imageWidth);
  const safeImageHeight = Math.max(1, imageHeight);
  const snapTolerance = Math.max(
    2,
    Math.round(Math.min(safeImageWidth / grid.columns, safeImageHeight / grid.rows) * 0.18)
  );
  const xExtent = snapExtentToImage(
    normalizedGridExtent(grid.bounds.x, grid.bounds.width, imageWidth),
    imageWidth,
    snapTolerance
  );
  const yExtent = snapExtentToImage(
    normalizedGridExtent(grid.bounds.y, grid.bounds.height, imageHeight),
    imageHeight,
    snapTolerance
  );

  if (xExtent.size <= 0 || yExtent.size <= 0) {
    return null;
  }

  const x1 = xExtent.start + (xExtent.size * column) / grid.columns;
  const x2 = xExtent.start + (xExtent.size * (column + 1)) / grid.columns;
  const y1 = yExtent.start + (yExtent.size * row) / grid.rows;
  const y2 = yExtent.start + (yExtent.size * (row + 1)) / grid.rows;

  const x = clamp(Math.round(x1), 0, imageWidth);
  const y = clamp(Math.round(y1), 0, imageHeight);
  const right = clamp(Math.round(x2), x, imageWidth);
  const bottom = clamp(Math.round(y2), y, imageHeight);

  if (right <= x || bottom <= y) {
    return null;
  }

  return {
    x,
    y,
    width: right - x,
    height: bottom - y
  };
}

export function cellRect(grid: GridDefinition, row: number, column: number): CellRect {
  return (
    getSafeCellRect(
      grid,
      row,
      column,
      Math.ceil(grid.bounds.x + grid.bounds.width),
      Math.ceil(grid.bounds.y + grid.bounds.height)
    ) ?? { x: 0, y: 0, width: 1, height: 1 }
  );
}

export function normalizeGridToImage(
  grid: GridDefinition,
  imageWidth: number,
  imageHeight: number
): GridDefinition {
  const rows = Math.max(1, Math.floor(grid.rows));
  const columns = Math.max(1, Math.floor(grid.columns));
  const safeImageWidth = Math.max(1, imageWidth);
  const safeImageHeight = Math.max(1, imageHeight);
  const snapTolerance = Math.max(
    2,
    Math.round(Math.min(safeImageWidth / columns, safeImageHeight / rows) * 0.18)
  );
  const xExtent = snapExtentToImage(
    normalizedGridExtent(grid.bounds.x, grid.bounds.width, imageWidth),
    imageWidth,
    snapTolerance
  );
  const yExtent = snapExtentToImage(
    normalizedGridExtent(grid.bounds.y, grid.bounds.height, imageHeight),
    imageHeight,
    snapTolerance
  );
  const normalizedX =
    xExtent.size > 0 ? xExtent : { start: 0, end: safeImageWidth, size: safeImageWidth };
  const normalizedY =
    yExtent.size > 0 ? yExtent : { start: 0, end: safeImageHeight, size: safeImageHeight };
  const bounds = {
    x: normalizedX.start,
    y: normalizedY.start,
    width: normalizedX.size,
    height: normalizedY.size
  };

  return {
    ...grid,
    rows,
    columns,
    cellWidth: bounds.width / columns,
    cellHeight: bounds.height / rows,
    bounds,
    verticalLines: Array.from({ length: columns + 1 }, (_, index) => ({
      index,
      position: bounds.x + (bounds.width * index) / columns,
      strength: grid.verticalLines[index]?.strength ?? 0
    })),
    horizontalLines: Array.from({ length: rows + 1 }, (_, index) => ({
      index,
      position: bounds.y + (bounds.height * index) / rows,
      strength: grid.horizontalLines[index]?.strength ?? 0
    }))
  };
}

export function normalizedRange(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a];
}
