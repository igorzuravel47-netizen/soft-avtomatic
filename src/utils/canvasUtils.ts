export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', {
    alpha: true,
    willReadFrequently: true
  });

  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  context.imageSmoothingEnabled = false;
  return context;
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = createCanvas(imageData.width, imageData.height);
  get2dContext(canvas).putImageData(imageData, 0, 0);
  return canvas;
}

export function cloneImageData(imageData: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
}

export function clearImageData(width: number, height: number): ImageData {
  return new ImageData(width, height);
}

export function composeImageData(layers: Array<{ imageData: ImageData | null; opacity: number }>): ImageData {
  const first = layers.find((layer) => layer.imageData)?.imageData;
  if (!first) {
    return new ImageData(1, 1);
  }

  const canvas = createCanvas(first.width, first.height);
  const context = get2dContext(canvas);

  layers.forEach((layer) => {
    if (!layer.imageData) {
      return;
    }

    context.globalAlpha = layer.opacity;
    context.drawImage(imageDataToCanvas(layer.imageData), 0, 0);
  });

  context.globalAlpha = 1;
  return context.getImageData(0, 0, first.width, first.height);
}
