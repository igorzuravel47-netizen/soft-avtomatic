import { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';

export function ToastViewport() {
  const toasts = useEditorStore((state) => state.toasts);
  const removeToast = useEditorStore((state) => state.removeToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => window.setTimeout(() => removeToast(toast.id), 2600));
    return () => timers.forEach(window.clearTimeout);
  }, [removeToast, toasts]);

  return (
    <div className="pointer-events-none fixed right-4 top-16 z-50 grid gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded-sm border px-4 py-2 text-sm shadow-lg" style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
