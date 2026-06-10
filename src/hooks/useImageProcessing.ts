import { useState } from 'react';
import { loadPngFile } from '../services/imageLoadService';
import { useEditorStore } from '../store/editorStore';

export function useImageProcessing() {
  const setImage = useEditorStore((state) => state.setImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const image = await loadPngFile(file);
      setImage(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image loading failed.');
    } finally {
      setLoading(false);
    }
  }

  return { loadFile, loading, error };
}
