import { Grid3X3 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGridDetection } from '../hooks/useGridDetection';
import { useEditorStore } from '../store/editorStore';

export function GridDetector() {
  const { t } = useTranslation();
  const image = useEditorStore((state) => state.image);
  const { grid, detect } = useGridDetection();

  useEffect(() => {
    if (image && !grid) {
      detect();
    }
  }, [detect, grid, image]);

  if (!image) {
    return null;
  }

  return (
    <section className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center gap-2">
        <Grid3X3 className="h-4 w-4" />
        <h2 className="font-semibold">{t('grid.auto')}</h2>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t('grid.description')}
      </p>
      <button
        type="button"
        className="mt-3 w-full border border-cyan-700 bg-cyan-700 px-3 py-2 text-sm font-medium text-white dark:border-cyan-500 dark:bg-cyan-500 dark:text-slate-950"
        onClick={() => detect()}
      >
        {t('grid.analyze')}
      </button>
      {grid ? (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
          <div>{t('grid.rows')}: {grid.rows}</div>
          <div>{t('grid.columns')}: {grid.columns}</div>
          <div>{t('grid.cell')}: {grid.cellWidth} x {grid.cellHeight}px</div>
          <div>
            {t('grid.bounds')}: {grid.bounds.x},{grid.bounds.y}
          </div>
          <div>{t('grid.lines')}: {grid.verticalLines.length}/{grid.horizontalLines.length}</div>
          <div>{t('grid.confidence')}: {Math.round(grid.confidence * 100)}%</div>
        </dl>
      ) : null}
    </section>
  );
}
