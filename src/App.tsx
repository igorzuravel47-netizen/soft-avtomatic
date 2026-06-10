import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomStatusBar } from './components/BottomStatusBar';
import { CanvasEditor } from './components/CanvasEditor';
import { ComparePreview } from './components/ComparePreview';
import { ExportPanel } from './components/ExportPanel';
import { GridDetector } from './components/GridDetector';
import { HelpModal } from './components/HelpModal';
import { ImagePreview } from './components/ImagePreview';
import { ImageUploader } from './components/ImageUploader';
import { SelectionTool } from './components/SelectionTool';
import { ToastViewport } from './components/ToastViewport';
import { TopToolbar } from './components/TopToolbar';
import { useHotkeys } from './hooks/useHotkeys';
import { i18next } from './i18n';
import { useEditorStore } from './store/editorStore';

function RecentFilesPanel() {
  const { t } = useTranslation();
  const recentFiles = useEditorStore((state) => state.recentFiles);

  return (
    <section className="editor-panel p-3">
      <h2 className="mb-2 font-display text-sm font-bold">{t('layout.recent')}</h2>
      {recentFiles.length ? (
        <div className="grid gap-1">
          {recentFiles.map((file) => (
            <div key={file} className="truncate text-xs" style={{ color: 'var(--muted)' }}>
              {file}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs" style={{ color: 'var(--muted)' }}>-</p>
      )}
    </section>
  );
}

function PropertiesPanel() {
  const { t } = useTranslation();
  const image = useEditorStore((state) => state.image);
  const grid = useEditorStore((state) => state.grid);
  const selectedCells = useEditorStore((state) => state.selectedCells);

  return (
    <section className="editor-panel p-3">
      <h2 className="mb-2 font-display text-sm font-bold">{t('layout.properties')}</h2>
      <div className="grid gap-2 text-xs font-mono" style={{ color: 'var(--muted)' }}>
        <span>{t('status.image')}: {image ? `${image.trimmedData.width} x ${image.trimmedData.height}` : '-'}</span>
        <span>{t('grid.cell')}: {grid ? `${grid.cellWidth} x ${grid.cellHeight}` : '-'}</span>
        <span>{t('selection.selected', { count: selectedCells.length })}</span>
      </div>
    </section>
  );
}

export function App() {
  const { t } = useTranslation();
  const image = useEditorStore((state) => state.image);
  const theme = useEditorStore((state) => state.theme);
  const themeMode = useEditorStore((state) => state.themeMode);
  const setThemeMode = useEditorStore((state) => state.setThemeMode);
  const language = useEditorStore((state) => state.language);
  const fullscreen = useEditorStore((state) => state.fullscreen);
  const viewMode = useEditorStore((state) => state.viewMode);

  useHotkeys();

  useEffect(() => {
    if (themeMode === 'system') {
      setThemeMode('system');
    }
  }, [setThemeMode, themeMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    void i18next.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    document.documentElement.requestFullscreen =
      document.documentElement.requestFullscreen ?? document.body.requestFullscreen;
    if (fullscreen && !document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else if (!fullscreen && document.fullscreenElement) {
      void document.exitFullscreen?.();
    }
  }, [fullscreen]);

  return (
    <main className="grid h-screen grid-rows-[auto_minmax(0,1fr)_auto]" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <TopToolbar />

      <div className="grid min-h-0 grid-cols-[320px_minmax(0,1fr)_340px] gap-2 p-2">
        <aside className="grid min-h-0 content-start gap-2 overflow-auto">
          <div className="px-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            {t('layout.upload')}
          </div>
          <ImageUploader />
          <RecentFilesPanel />
          <div className="px-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            {t('layout.analysis')}
          </div>
          <GridDetector />
          <ImagePreview />
        </aside>

        <section className="min-w-0 overflow-hidden">
          {viewMode === 'compare' ? <ComparePreview /> : <CanvasEditor />}
          {!image ? (
            <div className="mt-2 animate-pulse editor-panel p-4 text-sm" style={{ color: 'var(--muted)' }}>
              {t('upload.hint')}
            </div>
          ) : null}
        </section>

        <aside className="grid min-h-0 content-start gap-2 overflow-auto">
          <SelectionTool />
          <PropertiesPanel />
          <ExportPanel />
        </aside>
      </div>

      <BottomStatusBar />
      <HelpModal />
      <ToastViewport />
    </main>
  );
}
