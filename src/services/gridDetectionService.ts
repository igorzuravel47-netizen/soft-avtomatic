import type { GridDefinition, GridLine } from '../types/grid.types';

interface AxisResult {
  lines: GridLine[];
  cells: number;
  cellSize: number;
  start: number;
  end: number;
  confidence: number;
}

interface Bounds1d {
  start: number;
  end: number;
}

function luminanceAt(data: Uint8ClampedArray, index: number): number {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];
  return a === 0 ? 0 : 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturationAt(data: Uint8ClampedArray, index: number): number {
  const r = data[index] / 255;
  const g = data[index + 1] / 255;
  const b = data[index + 2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function colorDistance(data: Uint8ClampedArray, a: number, b: number): number {
  return (
    Math.abs(data[a] - data[b]) +
    Math.abs(data[a + 1] - data[b + 1]) +
    Math.abs(data[a + 2] - data[b + 2]) +
    Math.abs(data[a + 3] - data[b + 3])
  );
}

function isForegroundPixel(data: Uint8ClampedArray, index: number): boolean {
  const alpha = data[index + 3];
  if (alpha === 0) {
    return false;
  }

  const saturation = saturationAt(data, index);
  const luminance = luminanceAt(data, index);
  return alpha < 250 || saturation > 0.16 || luminance > 215;
}

function thresholdFromScores(scores: number[], floor: number): number {
  const sorted = scores.filter((score) => score > 0).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return floor;
  }

  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const p98 = sorted[Math.floor(sorted.length * 0.98)];
  return Math.max(floor, p90 + (p98 - p90) * 0.35);
}

function dominantRuns(scores: number[], threshold: number, mergeDistance = 2): GridLine[] {
  const lines: GridLine[] = [];
  let start = -1;
  let bestIndex = 0;
  let bestScore = 0;

  scores.forEach((score, index) => {
    if (score >= threshold) {
      if (start === -1) {
        start = index;
        bestIndex = index;
        bestScore = score;
      }
      if (score > bestScore) {
        bestIndex = index;
        bestScore = score;
      }
      return;
    }

    if (start !== -1) {
      lines.push({ index: lines.length, position: bestIndex, strength: bestScore });
      start = -1;
      bestScore = 0;
    }
  });

  if (start !== -1) {
    lines.push({ index: lines.length, position: bestIndex, strength: bestScore });
  }

  const merged: GridLine[] = [];
  for (const line of lines) {
    const previous = merged.at(-1);
    if (previous && line.position - previous.position <= mergeDistance) {
      if (line.strength > previous.strength) {
        previous.position = line.position;
        previous.strength = line.strength;
      }
    } else {
      merged.push({ ...line, index: merged.length });
    }
  }

  return merged;
}

function largestProjectedRun(scores: number[], minScore: number, maxGap = 3): Bounds1d | null {
  let best: Bounds1d | null = null;
  let bestLength = -1;
  let currentStart = -1;
  let lastHit = -1;

  scores.forEach((score, index) => {
    if (score >= minScore) {
      if (currentStart === -1) {
        currentStart = index;
      }
      lastHit = index;
    } else if (currentStart !== -1 && index - lastHit > maxGap) {
      const candidate = { start: currentStart, end: lastHit };
      const candidateLength = candidate.end - candidate.start;
      if (candidateLength > bestLength) {
        best = candidate;
        bestLength = candidateLength;
      }
      currentStart = -1;
      lastHit = -1;
    }
  });

  if (currentStart !== -1) {
    const candidate = { start: currentStart, end: lastHit };
    const candidateLength = candidate.end - candidate.start;
    if (candidateLength > bestLength) {
      best = candidate;
    }
  }

  return best;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

function inferStep(lines: GridLine[], span: number): number {
  const gaps = lines
    .slice(1)
    .map((line, index) => line.position - lines[index].position)
    .filter((gap) => gap >= 4);

  if (gaps.length === 0) {
    return Math.max(1, Math.round(span / 12));
  }

  const likelyGaps = gaps.filter((gap) => gap <= median(gaps) * 1.8);
  const base = likelyGaps.reduce((value, gap) => gcd(value, gap), Math.round(likelyGaps[0]));
  return Math.max(1, base >= 4 ? base : Math.round(median(likelyGaps)));
}

function buildRegularLines(start: number, end: number, step: number, rawLines: GridLine[]): GridLine[] {
  const span = Math.max(1, end - start);
  const cells = Math.max(1, Math.round(span / step));
  const snappedEnd = start + cells * step;
  const rawStrength = new Map(rawLines.map((line) => [line.position, line.strength]));

  return Array.from({ length: cells + 1 }, (_, index) => {
    const position = start + index * step;
    return {
      index,
      position,
      strength: rawStrength.get(position) ?? 0
    };
  }).filter((line) => line.position <= snappedEnd);
}

function analyzeAxis(
  lineScores: number[],
  foregroundScores: number[],
  fullLength: number,
  crossLength: number
): AxisResult {
  const foregroundBounds =
    largestProjectedRun(foregroundScores, Math.max(2, Math.ceil(crossLength * 0.02)), 6) ?? {
      start: 0,
      end: fullLength - 1
    };

  const lineThreshold = thresholdFromScores(lineScores, Math.max(4, crossLength * 0.08));
  const allLines = dominantRuns(lineScores, lineThreshold, 3);
  const inBounds = allLines.filter(
    (line) => line.position >= foregroundBounds.start - 3 && line.position <= foregroundBounds.end + 3
  );

  const activeLines = inBounds.length >= 2 ? inBounds : allLines;
  const firstLine = activeLines[0]?.position ?? foregroundBounds.start;
  const lastLine = activeLines.at(-1)?.position ?? foregroundBounds.end + 1;
  const roughStart = Math.max(0, Math.min(firstLine, foregroundBounds.start));
  const roughEnd = Math.min(fullLength, Math.max(lastLine, foregroundBounds.end + 1));
  const step = inferStep(activeLines, roughEnd - roughStart);
  const start = Math.max(0, Math.round(firstLine || roughStart));
  const cells = Math.max(1, Math.round((roughEnd - start) / step));
  const end = Math.min(fullLength, start + cells * step);
  const lines = buildRegularLines(start, end, step, activeLines);
  const matched = activeLines.filter(
    (line) => Math.abs((line.position - start) / step - Math.round((line.position - start) / step)) <= 0.18
  ).length;

  return {
    lines,
    cells,
    cellSize: step,
    start,
    end,
    confidence: activeLines.length ? Math.min(1, matched / Math.max(cells + 1, activeLines.length)) : 0.35
  };
}

export function detectGrid(imageData: ImageData, manual?: { rows?: number; columns?: number }): GridDefinition {
  const { data, width, height } = imageData;
  const verticalScores = new Array<number>(width).fill(0);
  const horizontalScores = new Array<number>(height).fill(0);
  const verticalForeground = new Array<number>(width).fill(0);
  const horizontalForeground = new Array<number>(height).fill(0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (isForegroundPixel(data, index)) {
        verticalForeground[x] += 1;
        horizontalForeground[y] += 1;
      }

      if (x > 0) {
        const previous = index - 4;
        const distance = colorDistance(data, index, previous);
        if (distance > 72) {
          verticalScores[x] += Math.min(255, distance);
        }
      }

      if (y > 0) {
        const previous = index - width * 4;
        const distance = colorDistance(data, index, previous);
        if (distance > 72) {
          horizontalScores[y] += Math.min(255, distance);
        }
      }
    }
  }

  const xAxis = analyzeAxis(verticalScores, verticalForeground, width, height);
  const yAxis = analyzeAxis(horizontalScores, horizontalForeground, height, width);
  const columns = Math.max(1, manual?.columns ?? xAxis.cells);
  const rows = Math.max(1, manual?.rows ?? yAxis.cells);
  const x = xAxis.start;
  const y = yAxis.start;
  const gridWidth = manual?.columns ? xAxis.cellSize * columns : xAxis.end - xAxis.start;
  const gridHeight = manual?.rows ? yAxis.cellSize * rows : yAxis.end - yAxis.start;
  const confidence = (xAxis.confidence + yAxis.confidence) / 2;

  return {
    rows,
    columns,
    cellWidth: Math.max(1, Math.round(gridWidth / columns)),
    cellHeight: Math.max(1, Math.round(gridHeight / rows)),
    bounds: { x, y, width: gridWidth, height: gridHeight },
    verticalLines: xAxis.lines,
    horizontalLines: yAxis.lines,
    confidence
  };
}
