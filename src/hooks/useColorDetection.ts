import { useCallback, useMemo } from 'react';
import {
  analyzeGridColors,
  applyColorIsolation,
  getColorStats,
  removeColorGroup
} from '../services/colorDetectionService';
import { useEditorStore } from '../store/editorStore';
import type { ColorGroup } from '../types/color.types';

export function useColorDetection() {
  const image = useEditorStore((state) => state.image);
  const grid = useEditorStore((state) => state.grid);
  const colors = useEditorStore((state) => state.colors);
  const thresholds = useEditorStore((state) => state.thresholds);
  const setColors = useEditorStore((state) => state.setColors);
  const updateLayerData = useEditorStore((state) => state.updateLayerData);
  const originalLayer = useEditorStore((state) => state.layers.find((layer) => layer.id === 'original'));

  const analyze = useCallback(() => {
    if (!image || !grid) {
      return [];
    }

    const analyzed = analyzeGridColors(image.trimmedData, grid, thresholds);
    setColors(analyzed);
    return analyzed;
  }, [grid, image, setColors, thresholds]);

  const isolate = useCallback(
    (group: ColorGroup) => {
      if (!originalLayer?.imageData || !grid) {
        return;
      }

      const source = colors.length ? colors : analyze();
      updateLayerData('mask', applyColorIsolation(originalLayer.imageData, grid, source, group));
    },
    [analyze, colors, grid, originalLayer?.imageData, updateLayerData]
  );

  const remove = useCallback(
    (group: ColorGroup) => {
      if (!originalLayer?.imageData || !grid) {
        return;
      }

      const source = colors.length ? colors : analyze();
      updateLayerData('editing', removeColorGroup(originalLayer.imageData, grid, source, group));
    },
    [analyze, colors, grid, originalLayer?.imageData, updateLayerData]
  );

  const stats = useMemo(() => getColorStats(colors), [colors]);

  return { colors, thresholds, stats, analyze, isolate, remove };
}
