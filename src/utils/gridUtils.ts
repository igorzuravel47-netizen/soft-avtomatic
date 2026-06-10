import type { CellCoordinate, GridDefinition } from '../types/grid.types';

export function cellId(row: number, column: number): string {
  return `${row}:${column}`;
}

export function gridColumnLinePosition(grid: GridDefinition, column: number): number {
  return (
    grid.verticalLines[column]?.position ??
    grid.bounds.x + column * grid.cellWidth
  );
}

export function gridRowLinePosition(grid: GridDefinition, row: number): number {
  return (
    grid.horizontalLines[row]?.position ??
    grid.bounds.y + row * grid.cellHeight
  );
}

export function cellFromPoint(
  grid: GridDefinition,
  x: number,
  y: number
): CellCoordinate | null {
  const left = gridColumnLinePosition(grid, 0);
  const top = gridRowLinePosition(grid, 0);
  const right = gridColumnLinePosition(grid, grid.columns);
  const bottom = gridRowLinePosition(grid, grid.rows);

  if (x < left || y < top || x >= right || y >= bottom) {
    return null;
  }

  let column = grid.columns - 1;
  let row = grid.rows - 1;

  for (let index = 0; index < grid.columns; index += 1) {
    const start = gridColumnLinePosition(grid, index);
    const end = gridColumnLinePosition(grid, index + 1);

    if (x >= start && x < end) {
      column = index;
      break;
    }
  }

  for (let index = 0; index < grid.rows; index += 1) {
    const start = gridRowLinePosition(grid, index);
    const end = gridRowLinePosition(grid, index + 1);

    if (y >= start && y < end) {
      row = index;
      break;
    }
  }

  return { row, column };
}

export function cellRect(grid: GridDefinition, row: number, column: number) {
  const x1 = gridColumnLinePosition(grid, column);
  const y1 = gridRowLinePosition(grid, row);
  const x2 = gridColumnLinePosition(grid, column + 1);
  const y2 = gridRowLinePosition(grid, row + 1);

  const x = Math.floor(Math.min(x1, x2));
  const y = Math.floor(Math.min(y1, y2));
  const right = Math.ceil(Math.max(x1, x2));
  const bottom = Math.ceil(Math.max(y1, y2));

  return {
    x,
    y,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y)
  };
}

export function normalizedRange(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a];
}