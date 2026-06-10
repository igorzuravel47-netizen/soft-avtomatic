import { Eraser, Grid3X3, PaintBucket, Pipette, MousePointer2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';
import { clearImageData, cloneImageData } from '../utils/canvasUtils';
import { cellId, cellRect } from '../utils/gridUtils';

type Grid = NonNullable<ReturnType<typeof useEditorStore.getState>['grid']>;

function fillCellWhite(
  imageData: ImageData,
  grid: Grid,
  row: number,
  column: number
) {
  const rect = cellRect(grid, row, column);

  const startX = rect.x;
  const startY = rect.y;

  const endX = rect.x + rect.width;
  const endY = rect.y + rect.height;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (
        x < 0 ||
        y < 0 ||
        x >= imageData.width ||
        y >= imageData.height
      ) {
        continue;
      }

      const index = (y * imageData.width + x) * 4;

      imageData.data[index] = 255;
      imageData.data[index + 1] = 255;
      imageData.data[index + 2] = 255;
      imageData.data[index + 3] = 255;
    }
  }
}
function fillRectWhite(imageData: ImageData, x: number, y: number, width: number, height: number) {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(imageData.width, Math.ceil(x + width));
  const endY = Math.min(imageData.height, Math.ceil(y + height));

  for (let nextY = startY; nextY < endY; nextY += 1) {
    for (let nextX = startX; nextX < endX; nextX += 1) {
      const index = (nextY * imageData.width + nextX) * 4;
      imageData.data[index] = 255;
      imageData.data[index + 1] = 255;
      imageData.data[index + 2] = 255;
      imageData.data[index + 3] = 255;
    }
  }
}

function isWhiteCell(imageData: ImageData, grid: Grid, row: number, column: number) {
  const rect = cellRect(grid, row, column);
  const startX = Math.max(0, Math.floor(rect.x + 1));
  const startY = Math.max(0, Math.floor(rect.y + 1));
  const endX = Math.min(imageData.width, Math.ceil(rect.x + rect.width - 1));
  const endY = Math.min(imageData.height, Math.ceil(rect.y + rect.height - 1));
  let white = 0;
  let visible = 0;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * imageData.width + x) * 4;
      const alpha = imageData.data[index + 3];
      if (alpha === 0) {
        continue;
      }
      visible += 1;
      if (
        imageData.data[index] >= 245 &&
        imageData.data[index + 1] >= 245 &&
        imageData.data[index + 2] >= 245
      ) {
        white += 1;
      }
    }
  }

  return visible > 0 && white / visible >= 0.82;
}

export function SelectionTool() {
  const { t } = useTranslation();
  const selectedCells = useEditorStore((state) => state.selectedCells);
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const grid = useEditorStore((state) => state.grid);
  const image = useEditorStore((state) => state.image);
  const editingLayer = useEditorStore((state) => state.layers.find((layer) => layer.id === 'editing'));
  const updateLayerData = useEditorStore((state) => state.updateLayerData);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const selectCells = useEditorStore((state) => state.selectCells);
  const showGridOverlay = useEditorStore((state) => state.showGridOverlay);
  const toggleGridOverlay = useEditorStore((state) => state.toggleGridOverlay);
  const latest = selectedCells.at(-1);
  const buttonClass = (tool: typeof activeTool) =>
    `editor-button ${
      activeTool === tool
        ? 'editor-button-primary'
        : ''
    }`;

  function fillSelectedWhite() {
    if (!grid || !image || selectedCells.length === 0) {
      return;
    }

    const base =
      editingLayer?.imageData ??
      clearImageData(image.trimmedData.width, image.trimmedData.height);
    const next = cloneImageData(base);
    const cellsToFill = selectedCells;

cellsToFill.forEach((cell) => {
  fillCellWhite(next, grid, cell.row, cell.column);
});
    updateLayerData('editing', next);
    useEditorStore.getState().addToast(t('toast.filled'));
    clearSelection();
  }

  useEffect(() => {
    window.addEventListener('png-grid-fill-selected-white', fillSelectedWhite);
    return () => window.removeEventListener('png-grid-fill-selected-white', fillSelectedWhite);
  });

  function removeGridEdgesInWhiteCells() {
    if (!grid || !image) {
      return;
    }

    const base =
      editingLayer?.imageData ??
      clearImageData(image.trimmedData.width, image.trimmedData.height);
    const next = cloneImageData(base);
    const source = editingLayer?.imageData ?? image.trimmedData;
    const whiteCells = new Set<string>();

    for (let row = 0; row < grid.rows; row += 1) {
      for (let column = 0; column < grid.columns; column += 1) {
        if (isWhiteCell(source, grid, row, column)) {
          whiteCells.add(cellId(row, column));
        }
      }
    }

    for (let row = 0; row < grid.rows; row += 1) {
      for (let column = 0; column < grid.columns; column += 1) {
        if (!whiteCells.has(cellId(row, column))) {
          continue;
        }

fillCellWhite(next, grid, row, column);     
      }
    }

    updateLayerData('editing', next);
  }

  function selectWholeGrid() {
    if (!grid) {
      return;
    }

    const cells = [];
    for (let row = 0; row < grid.rows; row += 1) {
      for (let column = 0; column < grid.columns; column += 1) {
        cells.push({ row, column, id: cellId(row, column), color: '#00000000' });
      }
    }
    selectCells(cells, false);
  }

  function selectWhiteCells() {
    if (!grid || !image) {
      return;
    }

    const source = editingLayer?.imageData ?? image.trimmedData;
    const cells = [];
    for (let row = 0; row < grid.rows; row += 1) {
      for (let column = 0; column < grid.columns; column += 1) {
        if (isWhiteCell(source, grid, row, column)) {
          cells.push({ row, column, id: cellId(row, column), color: '#ffffffff' });
        }
      }
    }
    selectCells(cells, false);
  }

  return (
    <section className="editor-panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <MousePointer2 className="h-4 w-4" />
        <h2 className="font-semibold">Selection</h2>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className={buttonClass('select')}
          title="Select cells"
          onClick={() => setActiveTool('select')}
        >
          <MousePointer2 className="h-4 w-4" />
          {t('selection.select')}
        </button>
        <button
          type="button"
          className={buttonClass('eyedropper')}
          title="Pick cell color and select all matching cells"
          onClick={() => setActiveTool('eyedropper')}
        >
          <Pipette className="h-4 w-4" />
          {t('selection.pipette')}
        </button>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="editor-button"
          disabled={!grid}
          onClick={selectWholeGrid}
        >
          <Grid3X3 className="h-4 w-4" />
          {t('selection.wholeGrid')}
        </button>
        <button
          type="button"
          className="editor-button"
          disabled={!grid || !image}
          onClick={selectWhiteCells}
        >
          {t('selection.whiteCells')}
        </button>
      </div>
      <button
        type="button"
        className="editor-button mb-3 w-full"
        disabled={!grid}
        onClick={toggleGridOverlay}
      >
        {showGridOverlay ? t('selection.hideGrid') : t('selection.showGrid')}
      </button>
      {latest ? (
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>{t('selection.row')}: {latest.row + 1}</div>
            <div>{t('selection.column')}: {latest.column + 1}</div>
          </div>
          <div className="flex items-center gap-2">
            <span>{t('selection.color')}:</span>
            <span className="h-5 w-5 border border-slate-300" style={{ background: latest.color }} />
            <span className="font-mono text-xs">{latest.color}</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('selection.selected', { count: selectedCells.length })}</p>
          <button
            type="button"
            className="editor-button w-full"
            disabled={selectedCells.length === 0}
            onClick={clearSelection}
          >
            {t('selection.clear')}
          </button>
          <button
            type="button"
            className="editor-button editor-button-primary w-full"
            disabled={!grid || selectedCells.length === 0}
            onClick={fillSelectedWhite}
          >
            <PaintBucket className="h-4 w-4" />
            {t('selection.fillWhite')}
          </button>
          <button
            type="button"
            className="editor-button w-full"
            style={{ color: 'var(--danger)' }}
            disabled={!grid || !image}
            onClick={removeGridEdgesInWhiteCells}
          >
            <Eraser className="h-4 w-4" />
            {t('selection.removeEdges')}
          </button>
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {t('selection.empty')}
        </p>
      )}
    </section>
  );
}
