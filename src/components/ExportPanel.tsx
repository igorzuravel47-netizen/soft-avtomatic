import { Redo2, RotateCcw, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';

export function ExportPanel() {
  const { t } = useTranslation();
  const image = useEditorStore((state) => state.image);
  const past = useEditorStore((state) => state.past);
  const future = useEditorStore((state) => state.future);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const resetEdits = useEditorStore((state) => state.resetEdits);

  return (
    <section className="editor-panel p-4">
      <h2 className="mb-3 font-semibold">{t('controls.title')}</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="editor-button"
          title="Undo"
          disabled={past.length === 0}
          onClick={undo}
        >
          <Undo2 className="h-4 w-4" />
          {t('app.undo')}
        </button>
        <button
          type="button"
          className="editor-button"
          title="Redo"
          disabled={future.length === 0}
          onClick={redo}
        >
          <Redo2 className="h-4 w-4" />
          {t('app.redo')}
        </button>
      </div>
      <button
        type="button"
        className="editor-button mt-2 w-full"
        title="Reset edits"
        disabled={!image}
        onClick={resetEdits}
      >
        <RotateCcw className="h-4 w-4" />
        {t('controls.reset')}
      </button>
    </section>
  );
}
