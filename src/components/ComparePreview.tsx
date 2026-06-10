import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { composeImageData, imageDataToCanvas } from '../utils/canvasUtils';

function PreviewCanvas({ imageData }: { imageData: ImageData | null }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !imageData) {
      return;
    }
    ref.current.width = imageData.width;
    ref.current.height = imageData.height;
    const context = ref.current.getContext('2d');
    if (!context) {
      return;
    }
    context.imageSmoothingEnabled = false;
    context.drawImage(imageDataToCanvas(imageData), 0, 0);
  }, [imageData]);

  return (
    <div className="checkerboard overflow-auto border border-slate-200 dark:border-slate-800">
      {imageData ? (
        <canvas
          ref={ref}
          style={{
            width: Math.min(320, imageData.width),
            height: Math.min(240, imageData.height)
          }}
        />
      ) : null}
    </div>
  );
}

export function ComparePreview() {
  const image = useEditorStore((state) => state.image);
  const layers = useEditorStore((state) => state.layers);
  const edited = image
    ? composeImageData(
        layers
          .filter((layer) => layer.visible)
          .map((layer) => ({ imageData: layer.imageData, opacity: layer.opacity }))
      )
    : null;

  if (!image) {
    return null;
  }

  return (
    <section className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="mb-3 font-semibold">Before / After</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm text-slate-500">Original</p>
          <PreviewCanvas imageData={image.trimmedData} />
        </div>
        <div>
          <p className="mb-1 text-sm text-slate-500">Edited</p>
          <PreviewCanvas imageData={edited} />
        </div>
      </div>
    </section>
  );
}
