import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { exportPng } from '../services/exportService';
import { useEditorStore } from '../store/editorStore';
import { cellId } from '../utils/gridUtils';

export function useHotkeys() {
  const { t } = useTranslation();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const state = useEditorStore.getState();
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault();
        state.undo();
      } else if ((event.ctrlKey || event.metaKey) && key === 'y') {
        event.preventDefault();
        state.redo();
      } else if ((event.ctrlKey || event.metaKey) && key === 's') {
        event.preventDefault();
        if (state.image) {
          void exportPng(state.layers, state.image.name).then(() => state.addToast(t('toast.exported')));
        }
      } else if ((event.ctrlKey || event.metaKey) && key === 'o') {
        event.preventDefault();
        window.dispatchEvent(new Event('png-grid-open-file'));
      } else if ((event.ctrlKey || event.metaKey) && key === 'a') {
        event.preventDefault();
        if (!state.grid) return;
        const cells = [];
        for (let row = 0; row < state.grid.rows; row += 1) {
          for (let column = 0; column < state.grid.columns; column += 1) {
            cells.push({ row, column, id: cellId(row, column), color: '#00000000' });
          }
        }
        state.selectCells(cells, false);
        state.addToast(t('toast.selectedAll'));
      } else if (event.key === 'Delete') {
        event.preventDefault();
        window.dispatchEvent(new Event('png-grid-fill-selected-white'));
      } else if (event.key === 'Escape') {
        state.clearSelection();
        state.setHelpOpen(false);
      } else if (event.key === '?' || ((event.ctrlKey || event.metaKey) && event.key === '/')) {
        event.preventDefault();
        state.setHelpOpen(true);
      } else if (event.key === 'F11') {
        event.preventDefault();
        state.toggleFullscreen();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [t]);
}
