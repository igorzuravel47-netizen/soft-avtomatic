import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageProcessing } from '../hooks/useImageProcessing';

export function ImageUploader() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { loadFile, loading, error } = useImageProcessing();

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) {
      void loadFile(file);
    }
  }

  return (
    <section
      className={`editor-panel flex min-h-40 flex-col items-center justify-center gap-3 border-dashed p-4 text-center transition ${
        dragging ? 'border-cyan-400 bg-cyan-400/10' : ''
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center border" style={{ borderColor: 'var(--border)', background: 'var(--panel-2)' }}>
        <Upload className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-display text-sm font-bold">{t('upload.title')}</h2>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>
          {t('upload.hint')}
        </p>
      </div>
      <button
        type="button"
        className="editor-button editor-button-primary w-full"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? t('upload.loading') : t('upload.choose')}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </section>
  );
}
