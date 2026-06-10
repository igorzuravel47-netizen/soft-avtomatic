import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useLayers } from '../hooks/useLayers';

export function LayerManager() {
  const { layers, toggleLayer, setLayerOpacity, clearLayer, deleteLayer } = useLayers();

  return (
    <section className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="mb-3 font-semibold">Layers</h2>
      <div className="space-y-3">
        {layers.map((layer) => (
          <div key={layer.id} className="border border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="border border-slate-300 p-2 dark:border-slate-700"
                title={layer.visible ? 'Hide layer' : 'Show layer'}
                onClick={() => toggleLayer(layer.id)}
              >
                {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{layer.name}</p>
                <p className="text-xs text-slate-500">{layer.kind}</p>
              </div>
              <button
                type="button"
                className="border border-slate-300 p-2 disabled:opacity-40 dark:border-slate-700"
                title="Delete layer"
                disabled={!layer.deletable}
                onClick={() => deleteLayer(layer.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-2 flex items-center gap-3 text-xs">
              Opacity
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={layer.opacity}
                className="flex-1 accent-cyan-500"
                onChange={(event) => setLayerOpacity(layer.id, Number(event.target.value))}
              />
            </label>
            <button
              type="button"
              className="mt-2 w-full border border-slate-300 px-2 py-1.5 text-xs disabled:opacity-40 dark:border-slate-700"
              disabled={layer.locked}
              onClick={() => clearLayer(layer.id)}
            >
              Clear Layer
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
