import { PaintBucket, Pipette, MousePointer2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';
import { clearImageData, cloneImageData } from '../utils/canvasUtils';
import { getSafeCellRect } from '../utils/gridUtils';

type Grid = NonNullable<ReturnType<typeof useEditorStore.getState>['grid']>;
const DEFAULT_FILL_COLOR = '#ffffff';

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '').trim();

  if (normalized.length !== 6) {
    return { r: 255, g: 255, b: 255 };
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return {
    r: Number.isNaN(r) ? 255 : r,
    g: Number.isNaN(g) ? 255 : g,
    b: Number.isNaN(b) ? 255 : b
  };
}

function isValidHexColor(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color);
}

function fillCellColor(imageData: ImageData, grid: Grid, row: number, column: number, color: string) {
  const rect = getSafeCellRect(grid, row, column, imageData.width, imageData.height);
  const fill = hexToRgb(color);

  if (!rect) {
    return;
  }

  const startX = rect.x;
  const startY = rect.y;
  const endX = rect.x + rect.width;
  const endY = rect.y + rect.height;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * imageData.width + x) * 4;

      imageData.data[index] = fill.r;
      imageData.data[index + 1] = fill.g;
      imageData.data[index + 2] = fill.b;
      imageData.data[index + 3] = 255;
    }
  }
}

export function SelectionTool() {
  const { t } = useTranslation();
  const [fillColor, setFillColor] = useState(DEFAULT_FILL_COLOR);
  const selectedCells = useEditorStore((state) => state.selectedCells);
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const grid = useEditorStore((state) => state.grid);
  const image = useEditorStore((state) => state.image);
  const editingLayer = useEditorStore((state) =>
    state.layers.find((layer) => layer.id === 'editing')
  );
  const updateLayerData = useEditorStore((state) => state.updateLayerData);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const addActionHistory = useEditorStore((state) => state.addActionHistory);
  const latest = selectedCells.at(-1);
  const buttonClass = (tool: typeof activeTool) =>
    `editor-button ${activeTool === tool ? 'editor-button-primary' : ''}`;

  function fillSelectedCells() {
    if (!grid || !image || selectedCells.length === 0) {
      return;
    }

    const base =
      editingLayer?.imageData ?? clearImageData(image.trimmedData.width, image.trimmedData.height);
    const next = cloneImageData(base);
    const cellsToFill = selectedCells;

    cellsToFill.forEach((cell) => {
      fillCellColor(next, grid, cell.row, cell.column, fillColor);
    });
    updateLayerData('editing', next);
    addActionHistory('fill-white', cellsToFill, cellsToFill.length, fillColor);
    useEditorStore.getState().addToast(t('toast.filled'));
    clearSelection();
  }

  useEffect(() => {
    window.addEventListener('png-grid-fill-selected-white', fillSelectedCells);
    return () => window.removeEventListener('png-grid-fill-selected-white', fillSelectedCells);
  });

  return (
    <section className="editor-panel p-4" data-tour="cell-selection">
      <div className="mb-3 flex items-center gap-2">
        <MousePointer2 className="h-4 w-4" />
        <h2 className="font-semibold">{t('layout.selection')}</h2>
      </div>
      <p className="mb-3 text-xs leading-5" style={{ color: 'var(--muted)' }}>
        {t('tooltips.canvas')}
      </p>
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
      {latest ? (
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              {t('selection.row')}: {latest.row + 1}
            </div>
            <div>
              {t('selection.column')}: {latest.column + 1}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>{t('selection.color')}:</span>
            <span
              className="h-5 w-5 border border-slate-300"
              style={{ background: latest.color }}
            />
            <span className="font-mono text-xs">{latest.color}</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {t('selection.selected', { count: selectedCells.length })}
          </p>
          <label className="grid gap-1 text-xs font-semibold">
            {t('selection.fillColor')}
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-9 w-12 border bg-transparent p-1"
                style={{ borderColor: 'var(--border)' }}
                value={isValidHexColor(fillColor) ? fillColor : DEFAULT_FILL_COLOR}
                onChange={(event) => setFillColor(event.target.value)}
              />
              <input
                type="text"
                className="editor-input min-w-0 flex-1 px-2 py-2 font-mono text-xs"
                value={fillColor}
                onChange={(event) => setFillColor(event.target.value)}
              />
            </div>
          </label>
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
            onClick={fillSelectedCells}
          >
            <PaintBucket className="h-4 w-4" />
            {t('selection.fill')}
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
