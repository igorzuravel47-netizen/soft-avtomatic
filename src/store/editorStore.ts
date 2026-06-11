import { create } from 'zustand';
import type { CellColorAnalysis, ColorGroup, ColorThresholds } from '../types/color.types';
import type { CellSelection, GridDefinition } from '../types/grid.types';
import type { LoadedImage, ViewMode } from '../types/image.types';
import type { EditorLayer } from '../types/layer.types';
import { cloneImageData, clearImageData } from '../utils/canvasUtils';
import { defaultThresholds } from '../utils/colorUtils';

const HISTORY_LIMIT = 50;

export type EditorTool = 'select' | 'eyedropper' | 'grid-eyedropper';
export type ThemeMode = 'system' | 'light' | 'dark';
export type ActionHistoryType =
  | 'select-cell'
  | 'select-cells'
  | 'clear-selection'
  | 'fill-white'
  | 'reset-edits'
  | 'undo'
  | 'redo';

interface ToastMessage {
  id: string;
  message: string;
}

export interface ActionHistoryEntry {
  id: string;
  type: ActionHistoryType;
  cells: CellSelection[];
  count: number;
  detail?: string;
  createdAt: number;
}

interface Snapshot {
  layers: EditorLayer[];
  selectedCells: CellSelection[];
}

interface EditorState {
  image: LoadedImage | null;
  grid: GridDefinition | null;
  colors: CellColorAnalysis[];
  thresholds: ColorThresholds;
  layers: EditorLayer[];
  selectedCells: CellSelection[];
  gridLineColor: string | null;
  gridLineTolerance: number;
  activeLayerId: string | null;
  activeTool: EditorTool;
  showGridOverlay: boolean;
  viewMode: ViewMode;
  zoom: number;
  cursor: { x: number; y: number; row: number | null; column: number | null };
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  language: 'uk' | 'en';
  helpOpen: boolean;
  fullscreen: boolean;
  recentFiles: string[];
  toasts: ToastMessage[];
  actionHistory: ActionHistoryEntry[];
  past: Snapshot[];
  future: Snapshot[];
  setImage: (image: LoadedImage) => void;
  setGrid: (grid: GridDefinition) => void;
  setColors: (colors: CellColorAnalysis[]) => void;
  setThreshold: (group: ColorGroup, key: keyof ColorThresholds[ColorGroup], value: number) => void;
  setActiveTool: (tool: EditorTool) => void;
  setGridLineColor: (color: string | null) => void;
  setGridLineTolerance: (value: number) => void;
  toggleGridOverlay: () => void;
  setViewMode: (mode: ViewMode) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setCursor: (cursor: { x: number; y: number; row: number | null; column: number | null }) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (language: 'uk' | 'en') => void;
  setHelpOpen: (open: boolean) => void;
  toggleFullscreen: () => void;
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
  addActionHistory: (type: ActionHistoryType, cells?: CellSelection[], count?: number, detail?: string) => void;
  addRecentFile: (name: string) => void;
  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  deleteLayer: (id: string) => void;
  clearLayer: (id: string) => void;
  updateLayerData: (id: string, imageData: ImageData | null, record?: boolean) => void;
  selectCell: (cell: CellSelection, additive: boolean) => void;
  selectCells: (cells: CellSelection[], additive: boolean) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  resetEdits: () => void;
}

function cloneLayer(layer: EditorLayer): EditorLayer {
  return {
    ...layer,
    imageData: layer.imageData ? cloneImageData(layer.imageData) : null
  };
}

function snapshot(state: EditorState): Snapshot {
  return {
    layers: state.layers.map(cloneLayer),
    selectedCells: [...state.selectedCells]
  };
}

function withHistory(state: EditorState) {
  return {
    past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT),
    future: []
  };
}

function actionEntry(
  type: ActionHistoryType,
  cells: CellSelection[] = [],
  count = cells.length,
  detail?: string
): ActionHistoryEntry {
  return {
    id: crypto.randomUUID(),
    type,
    cells: cells.slice(0, 30),
    count,
    detail,
    createdAt: Date.now()
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  image: null,
  grid: null,
  colors: [],
  thresholds: defaultThresholds,
  layers: [],
  selectedCells: [],
  gridLineColor: null,
  gridLineTolerance: 70,
  activeLayerId: null,
  activeTool: 'select',
  showGridOverlay: false,
  viewMode: 'edited',
  zoom: 1,
  cursor: { x: 0, y: 0, row: null, column: null },
  theme: 'dark',
  themeMode: (localStorage.getItem('png-grid-theme-mode') as ThemeMode | null) ?? 'system',
  language: (localStorage.getItem('png-grid-language') as 'uk' | 'en' | null) ?? 'uk',
  helpOpen: false,
  fullscreen: false,
  recentFiles: JSON.parse(localStorage.getItem('png-grid-recent-files') ?? '[]') as string[],
  toasts: [],
  actionHistory: [],
  past: [],
  future: [],

  setImage: (image) => {
    const originalLayer: EditorLayer = {
      id: 'original',
      name: 'Original Image',
      kind: 'original',
      visible: true,
      locked: true,
      opacity: 1,
      imageData: image.trimmedData,
      deletable: false
    };
    const maskLayer: EditorLayer = {
      id: 'mask',
      name: 'Color Selection Mask',
      kind: 'mask',
      visible: true,
      locked: false,
      opacity: 1,
      imageData: null,
      deletable: false
    };
    const editingLayer: EditorLayer = {
      id: 'editing',
      name: 'Editing Layer',
      kind: 'editing',
      visible: true,
      locked: false,
      opacity: 1,
      imageData: clearImageData(image.trimmedData.width, image.trimmedData.height),
      deletable: false
    };

    set({
      image,
      grid: null,
      colors: [],
      layers: [originalLayer, maskLayer, editingLayer],
      selectedCells: [],
      gridLineColor: get().gridLineColor,
      gridLineTolerance: get().gridLineTolerance,
      activeLayerId: 'editing',
      actionHistory: [],
      past: [],
      future: []
    });
    get().addRecentFile(image.name);
  },
  setGrid: (grid) => set({ grid }),
  setColors: (colors) => set({ colors }),
  setThreshold: (group, key, value) =>
    set((state) => ({
      thresholds: {
        ...state.thresholds,
        [group]: {
          ...state.thresholds[group],
          [key]: value
        }
      }
    })),
  setActiveTool: (activeTool) => set({ activeTool }),
  setGridLineColor: (gridLineColor) => set({ gridLineColor }),
  setGridLineTolerance: (value) =>
    set({ gridLineTolerance: Math.min(180, Math.max(0, Math.round(value))) }),
  toggleGridOverlay: () => set((state) => ({ showGridOverlay: !state.showGridOverlay })),
  setViewMode: (viewMode) => set({ viewMode }),
  setZoom: (zoom) => set({ zoom: Math.min(32, Math.max(0.05, zoom)) }),
  zoomIn: () => set((state) => ({ zoom: Math.min(32, state.zoom * 1.2) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(0.05, state.zoom / 1.2) })),
  setCursor: (cursor) => set({ cursor }),
  setThemeMode: (themeMode) => {
    localStorage.setItem('png-grid-theme-mode', themeMode);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    set({ themeMode, theme: themeMode === 'system' ? (systemDark ? 'dark' : 'light') : themeMode });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('png-grid-theme-mode', next);
    set({ theme: next, themeMode: next });
  },
  setLanguage: (language) => {
    localStorage.setItem('png-grid-language', language);
    set({ language });
  },
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
  addToast: (message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message }].slice(-4)
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),
  addActionHistory: (type, cells = [], count = cells.length, detail) =>
    set((state) => ({
      actionHistory: [actionEntry(type, cells, count, detail), ...state.actionHistory].slice(0, 30)
    })),
  addRecentFile: (name) =>
    set((state) => {
      const recentFiles = [name, ...state.recentFiles.filter((file) => file !== name)].slice(0, 8);
      localStorage.setItem('png-grid-recent-files', JSON.stringify(recentFiles));
      return { recentFiles };
    }),
  toggleLayer: (id) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    })),
  setLayerOpacity: (id, opacity) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, opacity } : layer))
    })),
  deleteLayer: (id) =>
    set((state) => ({
      ...withHistory(state),
      layers: state.layers.filter((layer) => layer.id !== id || !layer.deletable)
    })),
  clearLayer: (id) =>
    set((state) => ({
      ...withHistory(state),
      layers: state.layers.map((layer) => {
        if (layer.id !== id || layer.locked || !layer.imageData) {
          return layer;
        }
        return {
          ...layer,
          imageData: clearImageData(layer.imageData.width, layer.imageData.height)
        };
      })
    })),
  updateLayerData: (id, imageData, record = true) =>
    set((state) => ({
      ...(record ? withHistory(state) : {}),
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, imageData } : layer))
    })),
  selectCell: (cell, additive) =>
    set((state) => {
      const exists = state.selectedCells.some(
        (selected) => selected.row === cell.row && selected.column === cell.column
      );
      const selectedCells = additive
        ? exists
          ? state.selectedCells.filter(
              (selected) => selected.row !== cell.row || selected.column !== cell.column
            )
          : [...state.selectedCells, cell]
        : [cell];
      return {
        selectedCells,
        actionHistory: [actionEntry('select-cell', [cell], 1), ...state.actionHistory].slice(0, 30)
      };
    }),
  selectCells: (cells, additive) =>
    set((state) => {
      const map = new Map<string, CellSelection>();
      if (additive) {
        state.selectedCells.forEach((cell) => map.set(cell.id, cell));
      }
      cells.forEach((cell) => map.set(cell.id, cell));
      return {
        selectedCells: [...map.values()],
        actionHistory: [actionEntry('select-cells', cells, cells.length), ...state.actionHistory].slice(0, 30)
      };
    }),
  clearSelection: () =>
    set((state) => ({
      selectedCells: [],
      actionHistory: state.selectedCells.length
        ? [actionEntry('clear-selection', state.selectedCells, state.selectedCells.length), ...state.actionHistory].slice(0, 30)
        : state.actionHistory
    })),
  undo: () =>
    set((state) => {
      const previous = state.past.at(-1);
      if (!previous) {
        return state;
      }

      return {
        layers: previous.layers.map(cloneLayer),
        selectedCells: [...previous.selectedCells],
        past: state.past.slice(0, -1),
        future: [snapshot(state), ...state.future].slice(0, HISTORY_LIMIT),
        actionHistory: [actionEntry('undo', state.selectedCells, state.selectedCells.length), ...state.actionHistory].slice(0, 30)
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) {
        return state;
      }

      return {
        layers: next.layers.map(cloneLayer),
        selectedCells: [...next.selectedCells],
        past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        actionHistory: [actionEntry('redo', next.selectedCells, next.selectedCells.length), ...state.actionHistory].slice(0, 30)
      };
    }),
  resetEdits: () => {
    const image = get().image;
    if (image) {
      get().setImage(image);
      get().addActionHistory('reset-edits');
    }
  }
}));
