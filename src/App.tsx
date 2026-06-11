import { ChevronDown, ChevronRight, Clock3, PanelLeftClose, PanelLeftOpen, ScanLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomStatusBar } from './components/BottomStatusBar';
import { CanvasEditor } from './components/CanvasEditor';
import { ComparePreview } from './components/ComparePreview';
import { CookieBanner } from './components/CookieBanner';
import { HelpModal } from './components/HelpModal';
import { OnboardingTour } from './components/OnboardingTour';
import { SelectionTool } from './components/SelectionTool';
import { ToastViewport } from './components/ToastViewport';
import { TopToolbar } from './components/TopToolbar';
import { useGridDetection } from './hooks/useGridDetection';
import { useHotkeys } from './hooks/useHotkeys';
import { i18next } from './i18n';
import { useEditorStore } from './store/editorStore';

function formatCell(row: number, column: number) {
  return `${row + 1}:${column + 1}`;
}

function ActionHistoryPanel() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const actionHistory = useEditorStore((state) => state.actionHistory);

  return (
    <section className="editor-panel p-3">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Clock3 className="h-4 w-4 shrink-0" />
          <span className="truncate font-display text-sm font-bold">{t('history.title')}</span>
        </span>
        {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>

      {!collapsed && actionHistory.length ? (
        <div className="mt-3 grid gap-2">
          {actionHistory.map((entry) => {
            const visibleCells = entry.cells.slice(0, 12);
            const hiddenCount = Math.max(0, entry.count - visibleCells.length);

            return (
              <article key={entry.id} className="action-history-item">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate text-xs font-bold">{t(`history.actions.${entry.type}`)}</p>
                  <time className="shrink-0 text-[10px]" style={{ color: 'var(--muted)' }}>
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
                  {t('history.count', { count: entry.count })}
                </p>
                {entry.detail ? (
                  <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted)' }}>
                    <span>{t('history.detail')}</span>
                    <span className="h-4 w-4 border" style={{ borderColor: 'var(--border)', background: entry.detail }} />
                    <span className="font-mono">{entry.detail}</span>
                  </div>
                ) : null}
                {visibleCells.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {visibleCells.map((cell) => (
                      <span key={`${entry.id}-${cell.id}`} className="cell-chip" title={`${t('selection.row')} ${cell.row + 1}, ${t('selection.column')} ${cell.column + 1}`}>
                        {formatCell(cell.row, cell.column)}
                      </span>
                    ))}
                    {hiddenCount ? <span className="cell-chip">+{hiddenCount}</span> : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}

      {!collapsed && !actionHistory.length ? (
        <p className="mt-3 text-xs leading-5" style={{ color: 'var(--muted)' }}>
          {t('history.empty')}
        </p>
      ) : null}
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
      <div className="grid gap-2 text-xs font-mono" style={{ color: 'var(--muted)' }} data-tour="grid-detector">
        <span>{t('status.image')}: {image ? `${image.trimmedData.width} x ${image.trimmedData.height}` : '-'}</span>
        <span>{t('grid.cell')}: {grid ? `${grid.cellWidth} x ${grid.cellHeight}` : '-'}</span>
        <span>{t('selection.selected', { count: selectedCells.length })}</span>
      </div>
    </section>
  );
}

export function App() {
  const { t } = useTranslation();
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const image = useEditorStore((state) => state.image);
  const theme = useEditorStore((state) => state.theme);
  const themeMode = useEditorStore((state) => state.themeMode);
  const setThemeMode = useEditorStore((state) => state.setThemeMode);
  const language = useEditorStore((state) => state.language);
  const fullscreen = useEditorStore((state) => state.fullscreen);
  const viewMode = useEditorStore((state) => state.viewMode);
  const { grid, detect } = useGridDetection();

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
    if (image && !grid) {
      detect();
    }
  }, [detect, grid, image]);

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
      <TopToolbar onStartTour={() => setTourOpen(true)} />

      <div
        className="app-workspace grid min-h-0 gap-2 p-2"
        style={{ gridTemplateColumns: leftSidebarCollapsed ? '56px minmax(0,1fr) 340px' : '340px minmax(0,1fr) 340px' }}
      >
        <aside
          className={`left-sidebar editor-panel grid min-h-0 overflow-hidden ${
            leftSidebarCollapsed ? 'content-start p-2' : 'grid-rows-[auto_minmax(0,1fr)]'
          }`}
        >
          <div className={`flex items-center ${leftSidebarCollapsed ? 'justify-center' : 'justify-between border-b px-3 py-2'}`} style={{ borderColor: 'var(--border)' }}>
            {!leftSidebarCollapsed ? (
              <div>
                <p className="font-display text-sm font-bold">{t('layout.leftSidebar')}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {t('layout.leftSidebarHint')}
                </p>
              </div>
            ) : null}
            <button
              type="button"
              className="editor-icon-button"
              onClick={() => setLeftSidebarCollapsed((value) => !value)}
              title={leftSidebarCollapsed ? t('layout.expandSidebar') : t('layout.collapseSidebar')}
              aria-label={leftSidebarCollapsed ? t('layout.expandSidebar') : t('layout.collapseSidebar')}
            >
              {leftSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {leftSidebarCollapsed ? (
            <div className="mt-3 grid justify-items-center gap-2">
              <div className="sidebar-rail-item" title={t('layout.analysis')}>
                <ScanLine className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <div className="sidebar-scroll grid min-h-0 content-start gap-2 overflow-y-auto overflow-x-hidden p-2">
              <PropertiesPanel />
              <ActionHistoryPanel />
            </div>
          )}
        </aside>

        <section className="min-w-0 overflow-hidden">
          {viewMode === 'compare' ? <ComparePreview /> : <CanvasEditor />}
          {!image ? (
            <div className="mt-2 animate-pulse editor-panel p-4 text-sm" style={{ color: 'var(--muted)' }}>
              {t('upload.hint')}
            </div>
          ) : null}
        </section>

        <aside className="right-sidebar grid min-h-0 content-start gap-2 overflow-auto">
          <SelectionTool />
        </aside>
      </div>

      <BottomStatusBar />
      <HelpModal />
      <CookieBanner onShowTour={() => setTourOpen(true)} />
      <OnboardingTour open={tourOpen} onClose={() => setTourOpen(false)} />
      <ToastViewport />
    </main>
  );
}
