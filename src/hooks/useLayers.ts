import { useEditorStore } from '../store/editorStore';

export function useLayers() {
  return {
    layers: useEditorStore((state) => state.layers),
    activeLayerId: useEditorStore((state) => state.activeLayerId),
    toggleLayer: useEditorStore((state) => state.toggleLayer),
    setLayerOpacity: useEditorStore((state) => state.setLayerOpacity),
    clearLayer: useEditorStore((state) => state.clearLayer),
    deleteLayer: useEditorStore((state) => state.deleteLayer)
  };
}
