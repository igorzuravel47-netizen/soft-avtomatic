import type { LoadedImage } from '../types/image.types';
import { createCanvas, get2dContext } from '../utils/canvasUtils';
import { ensurePng } from '../utils/imageUtils';
import { autoTrim } from './cropService';

export async function loadPngFile(file: File): Promise<LoadedImage> {
  ensurePng(file);
  const bitmap = await createImageBitmap(file, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const canvas = createCanvas(bitmap.width, bitmap.height);
  const context = get2dContext(canvas);
  context.drawImage(bitmap, 0, 0);
  const originalData = context.getImageData(0, 0, bitmap.width, bitmap.height);
  const trimmed = autoTrim(originalData);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    fileSize: file.size,
    width: bitmap.width,
    height: bitmap.height,
    pixelCount: bitmap.width * bitmap.height,
    bitmap,
    originalData,
    trimmedData: trimmed.imageData,
    trimBounds: trimmed.bounds
  };
}
