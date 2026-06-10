import { useCallback } from 'react';
import { detectGrid } from '../services/gridDetectionService';
import { useEditorStore } from '../store/editorStore';

export function useGridDetection() {
  const image = useEditorStore((state) => state.image);
  const grid = useEditorStore((state) => state.grid);
  const setGrid = useEditorStore((state) => state.setGrid);

  const detect = useCallback(
    (manual?: { rows?: number; columns?: number }) => {
      if (!image) {
        return null;
      }

      const detected = detectGrid(image.trimmedData, manual);
      setGrid(detected);
      return detected;
    },
    [image, setGrid]
  );

  return { grid, detect };
}
