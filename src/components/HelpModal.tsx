import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';

const rows = [
  ['Ctrl + O', 'help.open'],
  ['Ctrl + S', 'help.save'],
  ['Ctrl + Z', 'help.undo'],
  ['Ctrl + Y', 'help.redo'],
  ['Ctrl + A', 'help.selectAll'],
  ['Delete', 'help.delete'],
  ['Esc', 'help.escape'],
  ['Space + Drag', 'help.pan'],
  ['Ctrl + Wheel', 'help.zoom'],
  ['F11', 'help.fullscreen'],
  ['? / Ctrl + /', 'help.help']
];

export function HelpModal() {
  const { t } = useTranslation();
  const open = useEditorStore((state) => state.helpOpen);
  const setHelpOpen = useEditorStore((state) => state.setHelpOpen);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <section className="w-full max-w-2xl shadow-2xl editor-panel">
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-display text-lg font-bold">{t('help.title')}</h2>
          <button className="editor-button" onClick={() => setHelpOpen(false)} aria-label={t('help.close')}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-2 p-4">
          {rows.map(([key, label]) => (
            <div key={key} className="grid grid-cols-[150px_1fr] items-center gap-3 border-b py-2 text-sm" style={{ borderColor: 'var(--border)' }}>
              <kbd className="font-mono">{key}</kbd>
              <span>{t(label)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
