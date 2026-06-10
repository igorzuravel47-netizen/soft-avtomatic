export type ColorGroup = 'blue' | 'red' | 'green';

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export interface ColorThreshold {
  hueMin: number;
  hueMax: number;
  saturationMin: number;
  valueMin: number;
}

export type ColorThresholds = Record<ColorGroup, ColorThreshold>;

export interface CellColorAnalysis {
  row: number;
  column: number;
  rgba: [number, number, number, number];
  hex: string;
  hsv: HsvColor;
  group: ColorGroup | null;
}

export interface ColorStats {
  blue: number;
  red: number;
  green: number;
  other: number;
}
