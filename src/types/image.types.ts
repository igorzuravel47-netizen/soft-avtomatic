export interface LoadedImage {
  id: string;
  name: string;
  fileSize: number;
  width: number;
  height: number;
  pixelCount: number;
  bitmap: ImageBitmap;
  originalData: ImageData;
  trimmedData: ImageData;
  trimBounds: Bounds;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ImageMetrics {
  width: number;
  height: number;
  pixelCount: number;
  fileSize: number;
}

export type ViewMode = 'original' | 'edited' | 'compare';
