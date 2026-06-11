import {
  Download,
  Expand,
  FileUp,
  HelpCircle,
  Languages,
  ListChecks,
  Maximize2,
  Moon,
  Redo2,
  RotateCcw,
  Sun,
  Undo2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { exportPng } from '../services/exportService';
import { useEditorStore } from '../store/editorStore';
import { i18next } from '../i18n';
import { Tooltip } from './Tooltip';

interface TopToolbarProps {
  onStartTour: () => void;
}

export function TopToolbar({ onStartTour }: TopToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { loadFile } = useImageProcessing();
  const image = useEditorStore((state) => state.image);
  const layers = useEditorStore((state) => state.layers);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const past = useEditorStore((state) => state.past);
  const future = useEditorStore((state) => state.future);
  const resetEdits = useEditorStore((state) => state.resetEdits);
  const theme = useEditorStore((state) => state.theme);
  const toggleTheme = useEditorStore((state) => state.toggleTheme);
  const language = useEditorStore((state) => state.language);
  const setLanguage = useEditorStore((state) => state.setLanguage);
  const zoomIn = useEditorStore((state) => state.zoomIn);
  const zoomOut = useEditorStore((state) => state.zoomOut);
  const setHelpOpen = useEditorStore((state) => state.setHelpOpen);
  const toggleFullscreen = useEditorStore((state) => state.toggleFullscreen);
  const addToast = useEditorStore((state) => state.addToast);

  function changeLanguage() {
    const next = language === 'uk' ? 'en' : 'uk';
    setLanguage(next);
    void i18next.changeLanguage(next);
  }

  useEffect(() => {
    const open = () => inputRef.current?.click();
    window.addEventListener('png-grid-open-file', open);
    return () => window.removeEventListener('png-grid-open-file', open);
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-3" style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
      <div className="flex min-w-0 items-center gap-2">
        <div className="mr-2 w-[260px] min-w-0">
          <h1 className="truncate font-display text-sm font-extrabold leading-4" title={t('app.title')}>{t('app.title')}</h1>
          <p className="truncate text-[11px]" style={{ color: 'var(--muted)' }} title={t('app.subtitle')}>{t('app.subtitle')}</p>
        </div>
        <Tooltip text={t('tooltips.openFile')}>
          <button className="editor-button toolbar-button" onClick={() => inputRef.current?.click()} title="Ctrl+O" data-tour="open-file">
            <FileUp className="h-4 w-4" />
            <span className="button-label">{t('app.open')}</span>
          </button>
        </Tooltip>
        <Tooltip text={t('tooltips.exportPng')}>
          <button
            className="editor-button editor-button-primary toolbar-button"
            disabled={!image}
            onClick={() => image && void exportPng(layers, image.name).then(() => addToast(t('toast.exported')))}
            title="Ctrl+S"
            data-tour="export-png"
          >
            <Download className="h-4 w-4" />
            <span className="button-label">{t('app.save')}</span>
          </button>
        </Tooltip>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="image/png"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void loadFile(file).then(() => addToast(t('toast.opened')));
            }
          }}
        />
      </div>

      <div className="flex items-center gap-1">
        <button className="editor-button toolbar-button" disabled={past.length === 0} onClick={undo} title="Ctrl+Z">
          <Undo2 className="h-4 w-4" />
          <span className="button-label">{t('app.undo')}</span>
        </button>
        <button className="editor-button toolbar-button" disabled={future.length === 0} onClick={redo} title="Ctrl+Y">
          <Redo2 className="h-4 w-4" />
          <span className="button-label">{t('app.redo')}</span>
        </button>
        <button className="editor-button toolbar-button toolbar-button-wide" disabled={!image} onClick={resetEdits} title={t('controls.reset')}>
          <RotateCcw className="h-4 w-4" />
          <span className="button-label">{t('controls.reset')}</span>
        </button>
        <button className="editor-button toolbar-icon-button" onClick={zoomOut} title={t('controls.zoomOut')}>
          <ZoomOut className="h-4 w-4" />
        </button>
        <button className="editor-button toolbar-icon-button" onClick={zoomIn} title={t('controls.zoomIn')}>
          <ZoomIn className="h-4 w-4" />
        </button>
        <button className="editor-button toolbar-button" onClick={() => window.dispatchEvent(new Event('png-grid-fit-screen'))}>
          <Expand className="h-4 w-4" />
          <span className="button-label">{t('controls.fit')}</span>
        </button>
        <button className="editor-button toolbar-short-button" onClick={() => window.dispatchEvent(new Event('png-grid-actual-size'))}>
          <span className="button-label">{t('controls.actual')}</span>
        </button>
        <button className="editor-button toolbar-button" onClick={onStartTour}>
          <ListChecks className="h-4 w-4" />
          <span className="button-label">{t('tour.button')}</span>
        </button>
        <button className="editor-button toolbar-short-button" onClick={changeLanguage}>
          <Languages className="h-4 w-4" />
          <span className="button-label">{language.toUpperCase()}</span>
        </button>
        <button className="editor-button toolbar-icon-button" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="editor-button toolbar-icon-button" onClick={() => setHelpOpen(true)} title="?">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="editor-button toolbar-icon-button" onClick={toggleFullscreen} title="F11">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
