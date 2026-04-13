import { useEffect, useState } from "react";
import { Palette, Pipette } from "lucide-react";
import { applyColorIntensity, normalizeHexColor } from "../utils/subscriptionColor";

const SHADE_OPTIONS = [300, 400, 500, 600, 700, 800] as const;

interface SubscriptionColorPickerProps {
  value: string;
  shade: number;
  onColorChange: (color: string) => void;
  onShadeChange: (shade: number) => void;
}

export function SubscriptionColorPicker({
  value,
  shade,
  onColorChange,
  onShadeChange,
}: SubscriptionColorPickerProps) {
  const normalized = normalizeHexColor(value);
  const [hexInput, setHexInput] = useState(normalized);

  useEffect(() => {
    setHexInput(normalized);
  }, [normalized]);

  const preview = applyColorIntensity(normalized, shade);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 inline-flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color de tarjeta
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400">{preview.toUpperCase()}</span>
      </div>

      <div className="flex items-center gap-3">
        <label
          className="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer shadow-sm"
          style={{ backgroundColor: normalized }}
          title="Seleccionar color base"
        >
          <input
            type="color"
            value={normalized}
            onChange={(e) => onColorChange(e.target.value)}
            className="sr-only"
          />
        </label>
        <div className="flex-1 relative">
          <Pipette className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={() => onColorChange(hexInput)}
            placeholder="#10b981"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Intensidad (similar a 400-500-700)
        </p>
        <div className="grid grid-cols-6 gap-2">
          {SHADE_OPTIONS.map((targetShade) => {
            const sample = applyColorIntensity(normalized, targetShade);
            const active = targetShade === shade;
            return (
              <button
                key={targetShade}
                type="button"
                onClick={() => onShadeChange(targetShade)}
                className={`rounded-lg border text-xs py-2 transition ${
                  active
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                style={{ backgroundColor: sample }}
                title={`Intensidad ${targetShade}`}
              >
                <span className="bg-black/40 text-white px-1.5 py-0.5 rounded">
                  {targetShade}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Vista previa final</p>
        <div className="h-10 rounded-md" style={{ backgroundColor: preview }} />
      </div>
    </div>
  );
}
