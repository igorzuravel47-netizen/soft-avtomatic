import type { EditorLayer } from '../types/layer.types';
import { createCanvas, get2dContext, imageDataToCanvas } from '../utils/canvasUtils';

export async function exportPng(layers: EditorLayer[], filename: string): Promise<void> {
  const base = layers.find((layer) => layer.visible && layer.imageData)?.imageData;
  if (!base) {
    throw new Error('There is no visible image data to export.');
  }

  const canvas = createCanvas(base.width, base.height);
  const context = get2dContext(canvas);
  context.clearRect(0, 0, canvas.width, canvas.height);

  layers
    .filter((layer) => layer.visible && layer.imageData)
    .forEach((layer) => {
      context.globalAlpha = layer.opacity;
      context.drawImage(imageDataToCanvas(layer.imageData!), 0, 0);
    });

  context.globalAlpha = 1;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('PNG export failed.'))), 'image/png');
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.replace(/\.png$/i, '') + '-edited.png';
  anchor.click();
  URL.revokeObjectURL(url);
}
