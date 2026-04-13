const TAILWIND_COLOR_HEX: Record<string, string> = {
  "bg-red-300": "#fca5a5",
  "bg-red-400": "#f87171",
  "bg-red-500": "#ef4444",
  "bg-red-600": "#dc2626",
  "bg-red-700": "#b91c1c",
  "bg-blue-300": "#93c5fd",
  "bg-blue-400": "#60a5fa",
  "bg-blue-500": "#3b82f6",
  "bg-blue-600": "#2563eb",
  "bg-blue-700": "#1d4ed8",
  "bg-emerald-300": "#6ee7b7",
  "bg-emerald-400": "#34d399",
  "bg-emerald-500": "#10b981",
  "bg-emerald-600": "#059669",
  "bg-emerald-700": "#047857",
  "bg-orange-300": "#fdba74",
  "bg-orange-400": "#fb923c",
  "bg-orange-500": "#f97316",
  "bg-orange-600": "#ea580c",
  "bg-orange-700": "#c2410c",
  "bg-purple-300": "#d8b4fe",
  "bg-purple-400": "#c084fc",
  "bg-purple-500": "#a855f7",
  "bg-purple-600": "#9333ea",
  "bg-purple-700": "#7e22ce",
  "bg-pink-300": "#f9a8d4",
  "bg-pink-400": "#f472b6",
  "bg-pink-500": "#ec4899",
  "bg-pink-600": "#db2777",
  "bg-pink-700": "#be185d",
  "bg-cyan-300": "#67e8f9",
  "bg-cyan-400": "#22d3ee",
  "bg-cyan-500": "#06b6d4",
  "bg-cyan-600": "#0891b2",
  "bg-cyan-700": "#0e7490",
  "bg-gray-300": "#d1d5db",
  "bg-gray-400": "#9ca3af",
  "bg-gray-500": "#6b7280",
  "bg-gray-600": "#4b5563",
  "bg-gray-700": "#374151",
};

export function resolveSubscriptionColor(color?: string) {
  if (!color) {
    return "#10b981";
  }

  if (color.startsWith("#")) {
    return color;
  }

  return TAILWIND_COLOR_HEX[color] || "#10b981";
}

export function subscriptionColorStyle(color?: string) {
  return { backgroundColor: resolveSubscriptionColor(color) };
}

export function isHexColor(value: string) {
  return /^#([0-9a-fA-F]{6})$/.test(value);
}

export function normalizeHexColor(value: string) {
  if (!value) {
    return "#10b981";
  }

  if (isHexColor(value)) {
    return value.toLowerCase();
  }

  return resolveSubscriptionColor(value);
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function applyColorIntensity(hex: string, shade: number) {
  const normalized = normalizeHexColor(hex);
  const { r, g, b } = hexToRgb(normalized);
  const factors: Record<number, number> = {
    300: 1.22,
    400: 1.1,
    500: 1,
    600: 0.88,
    700: 0.74,
    800: 0.6,
  };
  const factor = factors[shade] || 1;

  return rgbToHex(r * factor, g * factor, b * factor);
}
