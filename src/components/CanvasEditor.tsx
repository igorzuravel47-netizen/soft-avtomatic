import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { dominantCellColor } from '../services/colorDetectionService';
import { composeImageData, imageDataToCanvas } from '../utils/canvasUtils';
import {
  cellFromPoint,
  cellId,
  cellRect,
  gridColumnLinePosition,
  gridRowLinePosition,
  normalizedRange
} from '../utils/gridUtils';
import { useEditorStore } from '../store/editorStore';
import { rgbaToHex } from '../utils/colorUtils';
import type { CellSelection, GridDefinition } from '../types/grid.types';

// Колір заливки вибраної клітинки
// Те, що вибрано бордовою рамкою, після вибору стає білим
const SELECTED_CELL_FILL = {
  r: 255,
  g: 255,
  b: 255,
  a: 255
};

// Колір активного виділення
const SELECTED_CELL_STROKE = 'rgba(158, 0, 30, 1)';

// Відступи заливки від меж клітинки
// top/left = 0, щоб заливка не була занадто втиснута
// right/bottom лишаємо трохи меншими, щоб не зʼїдати бірюзову сітку
const CELL_FILL_INSET_TOP = 0;
const CELL_FILL_INSET_LEFT = 0;
const CELL_FILL_INSET_RIGHT = 1.3;
const CELL_FILL_INSET_BOTTOM = 1;

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  event: PointerEvent<HTMLCanvasElement>
) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height
  };
}

function paintRectToImageData(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const startX = Math.max(0, Math.floor(x + CELL_FILL_INSET_LEFT));
  const startY = Math.max(0, Math.floor(y + CELL_FILL_INSET_TOP));

  const endX = Math.min(
    imageData.width,
    Math.ceil(x + width - CELL_FILL_INSET_RIGHT)
  );

  const endY = Math.min(
    imageData.height,
    Math.ceil(y + height - CELL_FILL_INSET_BOTTOM)
  );

  if (endX <= startX || endY <= startY) {
    return;
  }

  for (let py = startY; py < endY; py += 1) {
    for (let px = startX; px < endX; px += 1) {
      const index = (py * imageData.width + px) * 4;

      imageData.data[index] = SELECTED_CELL_FILL.r;
      imageData.data[index + 1] = SELECTED_CELL_FILL.g;
      imageData.data[index + 2] = SELECTED_CELL_FILL.b;
      imageData.data[index + 3] = SELECTED_CELL_FILL.a;
    }
  }
}

function createSelectionMask(
  width: number,
  height: number,
  grid: GridDefinition,
  selectedCells: CellSelection[]
): ImageData {
  const mask = new ImageData(width, height);

  selectedCells.forEach((cell) => {
    const rect = cellRect(grid, cell.row, cell.column);

    paintRectToImageData(
      mask,
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );
  });

  return mask;
}

function drawGridOverlay(
  context: CanvasRenderingContext2D,
  grid: GridDefinition
) {
  context.strokeStyle = 'rgba(14, 165, 233, 0.95)';
  context.lineWidth = 1;

  const gridX = Math.round(gridColumnLinePosition(grid, 0));
  const gridY = Math.round(gridRowLinePosition(grid, 0));
  const gridRight = Math.round(gridColumnLinePosition(grid, grid.columns));
  const gridBottom = Math.round(gridRowLinePosition(grid, grid.rows));

  for (let col = 0; col <= grid.columns; col += 1) {
    const x = Math.round(gridColumnLinePosition(grid, col)) + 0.5;

    context.beginPath();
    context.moveTo(x, gridY);
    context.lineTo(x, gridBottom);
    context.stroke();
  }

  for (let row = 0; row <= grid.rows; row += 1) {
    const y = Math.round(gridRowLinePosition(grid, row)) + 0.5;

    context.beginPath();
    context.moveTo(gridX, y);
    context.lineTo(gridRight, y);
    context.stroke();
  }
}

function drawCellStroke(
  context: CanvasRenderingContext2D,
  grid: GridDefinition,
  row: number,
  column: number
) {
  const rect = cellRect(grid, row, column);

  context.strokeRect(
    rect.x + 0.5,
    rect.y + 0.5,
    Math.max(1, rect.width - 1),
    Math.max(1, rect.height - 1)
  );
}

export function CanvasEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const image = useEditorStore((state) => state.image);
  const grid = useEditorStore((state) => state.grid);
  const layers = useEditorStore((state) => state.layers);
  const zoom = useEditorStore((state) => state.zoom);
  const viewMode = useEditorStore((state) => state.viewMode);
  const activeTool = useEditorStore((state) => state.activeTool);
  const showGridOverlay = useEditorStore((state) => state.showGridOverlay);
  const setZoom = useEditorStore((state) => state.setZoom);
  const setCursor = useEditorStore((state) => state.setCursor);
  const selectedCells = useEditorStore((state) => state.selectedCells);
  const colors = useEditorStore((state) => state.colors);
  const selectCell = useEditorStore((state) => state.selectCell);
  const selectCells = useEditorStore((state) => state.selectCells);
  const updateLayerData = useEditorStore((state) => state.updateLayerData);

  const [dragStart, setDragStart] = useState<{ row: number; column: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; column: number } | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [panning, setPanning] = useState<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);

  const renderedData = useMemo(() => {
    if (!image) {
      return null;
    }

    if (viewMode === 'original') {
      return image.trimmedData;
    }

    return composeImageData(
      layers
        .filter((layer) => layer.visible)
        .map((layer) => ({
          imageData: layer.imageData,
          opacity: layer.opacity
        }))
    );
  }, [image, layers, viewMode]);

  useEffect(() => {
    if (!image || !grid) {
      return;
    }

    const mask = createSelectionMask(
      image.trimmedData.width,
      image.trimmedData.height,
      grid,
      selectedCells
    );

    updateLayerData('mask', mask, false);
  }, [image, grid, selectedCells, updateLayerData]);

  useEffect(() => {
    if (!canvasRef.current || !renderedData) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = renderedData.width;
    canvas.height = renderedData.height;

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(imageDataToCanvas(renderedData), 0, 0);

    if (grid) {
      if (showGridOverlay) {
        drawGridOverlay(context, grid);
      }

      if (dragStart && dragEnd) {
        context.strokeStyle = SELECTED_CELL_STROKE;
        context.lineWidth = 2;

        const [rowMin, rowMax] = normalizedRange(dragStart.row, dragEnd.row);
        const [colMin, colMax] = normalizedRange(dragStart.column, dragEnd.column);

        for (let row = rowMin; row <= rowMax; row += 1) {
          for (let column = colMin; column <= colMax; column += 1) {
            drawCellStroke(context, grid, row, column);
          }
        }
      }
    }
  }, [
    dragEnd,
    dragStart,
    grid,
    renderedData,
    showGridOverlay,
    zoom
  ]);

  const fitToScreen = useCallback(() => {
    if (!renderedData || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const nextZoom = Math.min(
      rect.width / renderedData.width,
      rect.height / renderedData.height
    );

    setZoom(Math.max(0.05, Math.min(32, nextZoom)));

    requestAnimationFrame(() => {
      if (!containerRef.current) {
        return;
      }

      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    });
  }, [renderedData, setZoom]);

  useEffect(() => {
    const fit = () => fitToScreen();
    const actual = () => setZoom(1);

    window.addEventListener('png-grid-fit-screen', fit);
    window.addEventListener('png-grid-actual-size', actual);

    return () => {
      window.removeEventListener('png-grid-fit-screen', fit);
      window.removeEventListener('png-grid-actual-size', actual);
    };
  }, [fitToScreen, setZoom]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpacePressed(true);
      }
    };

    const up = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  if (!image || !renderedData) {
    return (
      <section className="editor-panel flex min-h-96 items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Upload a PNG to begin.
        </p>
      </section>
    );
  }

  function selectionFromCell(row: number, column: number): CellSelection {
    const colorCell = colors.find(
      (cell) => cell.row === row && cell.column === column
    );

    let color = colorCell?.hex;

    if (!color && renderedData && grid) {
      const rect = cellRect(grid, row, column);
      const x = Math.floor(rect.x + rect.width / 2);
      const y = Math.floor(rect.y + rect.height / 2);
      const index = (y * renderedData.width + x) * 4;

      color = rgbaToHex(
        renderedData.data[index],
        renderedData.data[index + 1],
        renderedData.data[index + 2],
        renderedData.data[index + 3]
      );
    }

    return {
      row,
      column,
      id: cellId(row, column),
      color: color ?? '#00000000'
    };
  }

  function sameRgba(a: readonly number[], b: readonly number[]): boolean {
    return (
      a[0] === b[0] &&
      a[1] === b[1] &&
      a[2] === b[2] &&
      (a[3] ?? 255) === (b[3] ?? 255)
    );
  }

  function pipetteSelect(row: number, column: number, additive: boolean) {
    if (!grid || !renderedData) {
      return;
    }

    const target = dominantCellColor(renderedData, grid, row, column);
    const pickedColor = rgbaToHex(target[0], target[1], target[2], target[3]);
    const cells: CellSelection[] = [];

    for (let nextRow = 0; nextRow < grid.rows; nextRow += 1) {
      for (let nextColumn = 0; nextColumn < grid.columns; nextColumn += 1) {
        const candidate = dominantCellColor(
          renderedData,
          grid,
          nextRow,
          nextColumn
        );

        if (sameRgba(target, candidate)) {
          cells.push({
            row: nextRow,
            column: nextColumn,
            id: cellId(nextRow, nextColumn),
            color: pickedColor
          });
        }
      }
    }

    selectCells(cells, additive);
  }

  function commitDrag(additive: boolean) {
    if (!grid || !dragStart || !dragEnd) {
      return;
    }

    const [rowMin, rowMax] = normalizedRange(dragStart.row, dragEnd.row);
    const [colMin, colMax] = normalizedRange(dragStart.column, dragEnd.column);
    const cells: CellSelection[] = [];

    for (let row = rowMin; row <= rowMax; row += 1) {
      for (let column = colMin; column <= colMax; column += 1) {
        cells.push(selectionFromCell(row, column));
      }
    }

    selectCells(cells, additive);
  }

  return (
    <section className="editor-panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Canvas Editor</h2>

        <div className="text-sm" style={{ color: 'var(--muted)' }}>
          {renderedData.width} x {renderedData.height}px · pixel perfect
        </div>
      </div>

      <div
        ref={containerRef}
        className="checkerboard h-[calc(100vh-9rem)] overflow-auto border"
        style={{ borderColor: 'var(--border)' }}
        onWheel={(event) => {
          if (!event.ctrlKey || !containerRef.current) {
            return;
          }

          event.preventDefault();

          const container = containerRef.current;
          const rect = container.getBoundingClientRect();
          const beforeZoom = zoom;
          const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
          const nextZoom = Math.min(32, Math.max(0.05, zoom * factor));

          const contentX =
            (container.scrollLeft + event.clientX - rect.left) / beforeZoom;
          const contentY =
            (container.scrollTop + event.clientY - rect.top) / beforeZoom;

          setZoom(nextZoom);

          requestAnimationFrame(() => {
            container.scrollLeft = contentX * nextZoom - (event.clientX - rect.left);
            container.scrollTop = contentY * nextZoom - (event.clientY - rect.top);
          });
        }}
        onPointerMove={(event) => {
          if (panning && containerRef.current) {
            containerRef.current.scrollLeft =
              panning.left - (event.clientX - panning.x);
            containerRef.current.scrollTop =
              panning.top - (event.clientY - panning.y);
          }
        }}
        onPointerUp={() => setPanning(null)}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: renderedData.width * zoom,
            height: renderedData.height * zoom,
            cursor:
              spacePressed || panning
                ? 'grab'
                : activeTool === 'eyedropper'
                  ? 'crosshair'
                  : 'default'
          }}
          onPointerDown={(event) => {
            if ((event.button === 1 || spacePressed) && containerRef.current) {
              event.preventDefault();

              setPanning({
                x: event.clientX,
                y: event.clientY,
                left: containerRef.current.scrollLeft,
                top: containerRef.current.scrollTop
              });

              return;
            }

            if (!grid || !canvasRef.current) {
              return;
            }

            const point = getCanvasPoint(canvasRef.current, event);
            const cell = cellFromPoint(grid, point.x, point.y);

            if (!cell) {
              return;
            }

            if (activeTool === 'eyedropper') {
              pipetteSelect(cell.row, cell.column, event.shiftKey);
              return;
            }

            canvasRef.current.setPointerCapture(event.pointerId);
            setDragStart(cell);
            setDragEnd(cell);
          }}
          onPointerMove={(event) => {
            if (canvasRef.current) {
              const point = getCanvasPoint(canvasRef.current, event);
              const cell = grid ? cellFromPoint(grid, point.x, point.y) : null;

              setCursor({
                x: point.x,
                y: point.y,
                row: cell?.row ?? null,
                column: cell?.column ?? null
              });
            }

            if (
              activeTool === 'eyedropper' ||
              !grid ||
              !canvasRef.current ||
              !dragStart
            ) {
              return;
            }

            const point = getCanvasPoint(canvasRef.current, event);
            const cell = cellFromPoint(grid, point.x, point.y);

            if (cell) {
              setDragEnd(cell);
            }
          }}
          onPointerUp={(event) => {
            if (dragStart && dragEnd) {
              if (
                dragStart.row === dragEnd.row &&
                dragStart.column === dragEnd.column
              ) {
                selectCell(
                  selectionFromCell(dragStart.row, dragStart.column),
                  event.shiftKey
                );
              } else {
                commitDrag(event.shiftKey);
              }
            }

            if (
              canvasRef.current &&
              canvasRef.current.hasPointerCapture(event.pointerId)
            ) {
              canvasRef.current.releasePointerCapture(event.pointerId);
            }

            setDragStart(null);
            setDragEnd(null);
          }}
        />
      </div>
    </section>
  );
} 