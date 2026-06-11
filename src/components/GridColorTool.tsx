import { ScanLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';

export function GridColorTool() {
  const { t } = useTranslation();
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const gridLineColor = useEditorStore((state) => state.gridLineColor);
  const gridLineTolerance = useEditorStore((state) => state.gridLineTolerance);
  const setGridLineTolerance = useEditorStore((state) => state.setGridLineTolerance);

  return (
    <section className="editor-panel p-4" data-tour="grid-color-tool">
      <div className="mb-3 flex items-center gap-2">
        <ScanLine className="h-4 w-4" />
        <h2 className="font-semibold">{t('layout.gridDetection')}</h2>
      </div>
      <p className="mb-3 text-xs leading-5" style={{ color: 'var(--muted)' }}>
        {t('grid.colorPipetteHint')}
      </p>
      <button
        type="button"
        className={`editor-button mb-3 w-full ${
          activeTool === 'grid-eyedropper' ? 'editor-button-primary' : ''
        }`}
        title={t('selection.gridPipette')}
        onClick={() => setActiveTool('grid-eyedropper')}
      >
        <ScanLine className="h-4 w-4" />
        <span className="button-label">{t('selection.gridPipette')}</span>
      </button>
      <div className="grid gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{t('selection.gridColor')}:</span>
          <span
            className="h-5 w-5 border border-slate-300"
            style={{ background: gridLineColor ?? 'transparent' }}
          />
          <span className="font-mono">{gridLineColor ?? '-'}</span>
        </div>
        <label className="grid gap-2 font-semibold">
          <span className="flex items-center justify-between gap-2">
            <span>{t('selection.gridTolerance')}</span>
            <span className="font-mono">{gridLineTolerance}</span>
          </span>
          <input
            type="range"
            min="0"
            max="180"
            value={gridLineTolerance}
            onChange={(event) => setGridLineTolerance(Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
