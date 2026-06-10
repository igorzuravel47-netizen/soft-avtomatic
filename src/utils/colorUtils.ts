import type { ColorGroup, ColorThreshold, ColorThresholds, HsvColor } from '../types/color.types';

export const defaultThresholds: ColorThresholds = {
  blue: { hueMin: 190, hueMax: 255, saturationMin: 0.18, valueMin: 0.12 },
  red: { hueMin: 340, hueMax: 25, saturationMin: 0.18, valueMin: 0.12 },
  green: { hueMin: 75, hueMax: 165, saturationMin: 0.18, valueMin: 0.12 }
};

export function rgbaToHex(r: number, g: number, b: number, a = 255): string {
  const parts = [r, g, b, a].map((value) => value.toString(16).padStart(2, '0'));
  return `#${parts.join('')}`;
}

export function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6);
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2);
    } else {
      h = 60 * ((rn - gn) / delta + 4);
    }
  }

  if (h < 0) {
    h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  return { h, s, v: max };
}

export function hueMatches(hue: number, threshold: ColorThreshold): boolean {
  if (threshold.hueMin <= threshold.hueMax) {
    return hue >= threshold.hueMin && hue <= threshold.hueMax;
  }

  return hue >= threshold.hueMin || hue <= threshold.hueMax;
}

export function classifyColor(
  r: number,
  g: number,
  b: number,
  a: number,
  thresholds: ColorThresholds
): ColorGroup | null {
  if (a === 0) {
    return null;
  }

  const hsv = rgbToHsv(r, g, b);
  const groups = Object.entries(thresholds) as Array<[ColorGroup, ColorThreshold]>;
  const match = groups.find(([, threshold]) => {
    return (
      hueMatches(hsv.h, threshold) &&
      hsv.s >= threshold.saturationMin &&
      hsv.v >= threshold.valueMin
    );
  });

  return match?.[0] ?? null;
}
