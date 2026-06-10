import { Eye, Eraser, ScanEye } from 'lucide-react';
import { useColorDetection } from '../hooks/useColorDetection';
import { useEditorStore } from '../store/editorStore';
import type { ColorGroup } from '../types/color.types';

const groups: ColorGroup[] = ['blue', 'red', 'green'];

export function ColorFilterPanel() {
  const { thresholds, stats, analyze, isolate, remove } = useColorDetection();
  const setThreshold = useEditorStore((state) => state.setThreshold);
  const grid = useEditorStore((state) => state.grid);

  return (
    <section className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">HSV Colors</h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
          disabled={!grid}
          onClick={() => analyze()}
        >
          <ScanEye className="h-4 w-4" />
          Analyze
        </button>
      </div>
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group} className="border border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="capitalize">{group}</span>
              <span className="text-sm text-slate-500">{stats[group]} cells</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['hueMin', 'hueMax', 'saturationMin', 'valueMin'] as const).map((key) => (
                <label key={key}>
                  {key}
                  <input
                    type="number"
                    step={key.startsWith('hue') ? 1 : 0.01}
                    value={thresholds[group][key]}
                    className="mt-1 w-full border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-700"
                    onChange={(event) => setThreshold(group, key, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 border border-slate-300 px-2 py-2 text-xs dark:border-slate-700"
                disabled={!grid}
                onClick={() => isolate(group)}
              >
                <Eye className="h-3.5 w-3.5" />
                Show only
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 border border-red-300 px-2 py-2 text-xs text-red-700 dark:border-red-800 dark:text-red-300"
                disabled={!grid}
                onClick={() => remove(group)}
              >
                <Eraser className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
