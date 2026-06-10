import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';

export function BottomStatusBar() {
  const { t } = useTranslation();
  const image = useEditorStore((state) => state.image);
  const grid = useEditorStore((state) => state.grid);
  const cursor = useEditorStore((state) => state.cursor);
  const zoom = useEditorStore((state) => state.zoom);

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t px-3 text-xs" style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
      <div className="flex items-center gap-5 font-mono" style={{ color: 'var(--muted)' }}>
        <span>{t('status.cursor')}: {Math.round(cursor.x)}, {Math.round(cursor.y)}</span>
        <span>{t('status.cell')}: {cursor.row === null ? '-' : `${cursor.row + 1}:${(cursor.column ?? 0) + 1}`}</span>
        <span>{t('status.zoom')}: {Math.round(zoom * 100)}%</span>
        <span>{t('status.image')}: {image ? `${image.trimmedData.width} x ${image.trimmedData.height}` : '-'}</span>
        <span>{t('grid.cell')}: {grid ? `${grid.cellWidth} x ${grid.cellHeight}` : '-'}</span>
      </div>
      <span style={{ color: 'var(--muted)' }}>{t('status.ready')}</span>
    </footer>
  );
}
