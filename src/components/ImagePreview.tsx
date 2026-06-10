import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { imageDataToCanvas } from '../utils/canvasUtils';
import { formatBytes, formatPixels } from '../utils/imageUtils';

export function ImagePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const image = useEditorStore((state) => state.image);
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);

  useEffect(() => {
    if (!image || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = image.trimmedData.width;
    canvas.height = image.trimmedData.height;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(imageDataToCanvas(image.trimmedData), 0, 0);
  }, [image]);

  if (!image) {
    return null;
  }

  return (
    <section className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{image.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {image.width} x {image.height} px · {formatPixels(image.pixelCount)} pixels ·{' '}
            {formatBytes(image.fileSize)}
          </p>
          <p className="text-xs text-slate-500">
            Auto trim: {image.trimmedData.width} x {image.trimmedData.height} px from x
            {image.trimBounds.minX}, y{image.trimBounds.minY}
          </p>
        </div>
        <label className="flex min-w-48 items-center gap-3 text-sm">
          Zoom
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={zoom}
            className="w-full accent-cyan-500"
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <span className="w-12 text-right">{zoom}x</span>
        </label>
      </div>
      <div className="checkerboard max-h-72 overflow-auto border border-slate-200 dark:border-slate-800">
        <canvas
          ref={canvasRef}
          style={{
            width: image.trimmedData.width * zoom,
            height: image.trimmedData.height * zoom
          }}
        />
      </div>
    </section>
  );
}
