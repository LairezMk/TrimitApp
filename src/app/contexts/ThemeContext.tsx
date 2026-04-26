import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "light" | "dark";
export type VisualThemeId =
  | "trimit-aurora"
  | "nova-neon"
  | "midnight-glass"
  | "sunset-paper";

interface VisualThemeConfig {
  id: VisualThemeId;
  name: string;
  description: string;
  fontFamily: string;
  cursorDot: string;
  cursorRing: string;
  cursorTrail: string;
  ripple: string;
  navGlow: string;
  gradient: string;
  particleColorLight: string;
  particleColorDark: string;
  pageDuration: string;
  staggerDuration: string;
  cardLift: string;
  particleCount: number;
  palette: {
    light: {
      appBg: string;
      card: string;
      cardAlt: string;
      border: string;
      text: string;
      textMuted: string;
      accent: string;
      accentSoft: string;
      sidebar: string;
    };
    dark: {
      appBg: string;
      card: string;
      cardAlt: string;
      border: string;
      text: string;
      textMuted: string;
      accent: string;
      accentSoft: string;
      sidebar: string;
    };
  };
}

export const VISUAL_THEME_PRESETS: VisualThemeConfig[] = [
  {
    id: "trimit-aurora",
    name: "Aurora Trimit",
    description: "Equilibrado, limpio y moderno con acento esmeralda-cian.",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    cursorDot: "rgba(16, 185, 129, 0.95)",
    cursorRing: "rgba(34, 211, 238, 0.78)",
    cursorTrail: "rgba(16, 185, 129, 0.3)",
    ripple: "rgba(16, 185, 129, 0.72)",
    navGlow: "rgba(16, 185, 129, 0.34)",
    gradient: "#22c55e, #06b6d4, #6366f1, #22c55e",
    particleColorLight: "rgba(16, 185, 129, 0.38)",
    particleColorDark: "rgba(34, 211, 238, 0.4)",
    pageDuration: "520ms",
    staggerDuration: "500ms",
    cardLift: "1.02",
    particleCount: 22,
    palette: {
      light: {
        appBg: "#f4fbf8",
        card: "#ffffff",
        cardAlt: "#ecfdf5",
        border: "#cdeee1",
        text: "#0f172a",
        textMuted: "#475569",
        accent: "#10b981",
        accentSoft: "#d1fae5",
        sidebar: "#f2fbf7",
      },
      dark: {
        appBg: "#061412",
        card: "#0b1f1b",
        cardAlt: "#13332d",
        border: "#1f4a41",
        text: "#e2f6ef",
        textMuted: "#9ec8bb",
        accent: "#14b8a6",
        accentSoft: "#12352f",
        sidebar: "#0b1f1b",
      },
    },
  },
  {
    id: "nova-neon",
    name: "Nova Neon",
    description: "Más energético, vibrante y futurista para sesiones intensas.",
    fontFamily:
      "Sora, Space Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    cursorDot: "rgba(56, 189, 248, 0.95)",
    cursorRing: "rgba(168, 85, 247, 0.82)",
    cursorTrail: "rgba(59, 130, 246, 0.36)",
    ripple: "rgba(99, 102, 241, 0.7)",
    navGlow: "rgba(56, 189, 248, 0.34)",
    gradient: "#22d3ee, #6366f1, #a855f7, #22d3ee",
    particleColorLight: "rgba(14, 165, 233, 0.34)",
    particleColorDark: "rgba(139, 92, 246, 0.44)",
    pageDuration: "460ms",
    staggerDuration: "420ms",
    cardLift: "1.035",
    particleCount: 30,
    palette: {
      light: {
        appBg: "#eef6ff",
        card: "#f9f5ff",
        cardAlt: "#eef2ff",
        border: "#d9dcff",
        text: "#1e1b4b",
        textMuted: "#4c3f8c",
        accent: "#6366f1",
        accentSoft: "#e0e7ff",
        sidebar: "#f2f4ff",
      },
      dark: {
        appBg: "#080b1e",
        card: "#131637",
        cardAlt: "#1d2250",
        border: "#313a7a",
        text: "#e5e7ff",
        textMuted: "#b8bdf5",
        accent: "#7c3aed",
        accentSoft: "#2a2150",
        sidebar: "#10122b",
      },
    },
  },
  {
    id: "midnight-glass",
    name: "Midnight Glass",
    description: "Elegante y sobrio, con movimiento más suave y cinematográfico.",
    fontFamily:
      "Manrope, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    cursorDot: "rgba(99, 102, 241, 0.92)",
    cursorRing: "rgba(148, 163, 184, 0.72)",
    cursorTrail: "rgba(99, 102, 241, 0.26)",
    ripple: "rgba(99, 102, 241, 0.62)",
    navGlow: "rgba(99, 102, 241, 0.3)",
    gradient: "#818cf8, #38bdf8, #22d3ee, #818cf8",
    particleColorLight: "rgba(99, 102, 241, 0.24)",
    particleColorDark: "rgba(148, 163, 184, 0.34)",
    pageDuration: "620ms",
    staggerDuration: "600ms",
    cardLift: "1.015",
    particleCount: 16,
    palette: {
      light: {
        appBg: "#f5f7fb",
        card: "#ffffff",
        cardAlt: "#eef2f7",
        border: "#d9e1ea",
        text: "#0f172a",
        textMuted: "#4b5563",
        accent: "#6366f1",
        accentSoft: "#e0e7ff",
        sidebar: "#f2f5f9",
      },
      dark: {
        appBg: "#090d16",
        card: "#101827",
        cardAlt: "#172236",
        border: "#29364c",
        text: "#e5edf8",
        textMuted: "#9fb2ca",
        accent: "#818cf8",
        accentSoft: "#1f2b4a",
        sidebar: "#0e1623",
      },
    },
  },
  {
    id: "sunset-paper",
    name: "Sunset Paper",
    description: "Cálido, creativo y editorial con un tono más humano.",
    fontFamily:
      "DM Sans, Nunito, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    cursorDot: "rgba(245, 158, 11, 0.9)",
    cursorRing: "rgba(249, 115, 22, 0.74)",
    cursorTrail: "rgba(245, 158, 11, 0.25)",
    ripple: "rgba(249, 115, 22, 0.6)",
    navGlow: "rgba(251, 146, 60, 0.32)",
    gradient: "#f59e0b, #f97316, #ec4899, #f59e0b",
    particleColorLight: "rgba(249, 115, 22, 0.28)",
    particleColorDark: "rgba(245, 158, 11, 0.36)",
    pageDuration: "560ms",
    staggerDuration: "540ms",
    cardLift: "1.025",
    particleCount: 20,
    palette: {
      light: {
        appBg: "#fff7ed",
        card: "#fffdf8",
        cardAlt: "#ffedd5",
        border: "#fed7aa",
        text: "#431407",
        textMuted: "#7c2d12",
        accent: "#f97316",
        accentSoft: "#ffedd5",
        sidebar: "#fff5e7",
      },
      dark: {
        appBg: "#1a0b05",
        card: "#2a1208",
        cardAlt: "#3a1a0e",
        border: "#5b2a16",
        text: "#ffedd5",
        textMuted: "#fdba74",
        accent: "#fb923c",
        accentSoft: "#4a220f",
        sidebar: "#261106",
      },
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  visualTheme: VisualThemeId;
  setVisualTheme: (theme: VisualThemeId) => void;
  resetVisualTheme: () => void;
  visualThemeOptions: VisualThemeConfig[];
  activeVisualThemeConfig: VisualThemeConfig;
}

export const DEFAULT_VISUAL_THEME: VisualThemeId = "trimit-aurora";
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function findVisualThemeConfig(themeId: VisualThemeId) {
  return (
    VISUAL_THEME_PRESETS.find((theme) => theme.id === themeId) || VISUAL_THEME_PRESETS[0]
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("trimit-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  const [visualTheme, setVisualTheme] = useState<VisualThemeId>(() => {
    const savedTheme = localStorage.getItem("trimit-visual-theme");
    const exists = VISUAL_THEME_PRESETS.some((theme) => theme.id === savedTheme);
    return exists ? (savedTheme as VisualThemeId) : DEFAULT_VISUAL_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("trimit-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const profile = findVisualThemeConfig(visualTheme);

    root.setAttribute("data-visual-theme", profile.id);
    root.style.setProperty("--trimit-font-family", profile.fontFamily);
    root.style.setProperty("--trimit-cursor-dot", profile.cursorDot);
    root.style.setProperty("--trimit-cursor-ring", profile.cursorRing);
    root.style.setProperty("--trimit-cursor-trail", profile.cursorTrail);
    root.style.setProperty("--trimit-ripple", profile.ripple);
    root.style.setProperty("--trimit-nav-glow", profile.navGlow);
    root.style.setProperty("--trimit-gradient-colors", profile.gradient);
    root.style.setProperty("--trimit-particle-color-light", profile.particleColorLight);
    root.style.setProperty("--trimit-particle-color-dark", profile.particleColorDark);
    root.style.setProperty("--trimit-page-duration", profile.pageDuration);
    root.style.setProperty("--trimit-stagger-duration", profile.staggerDuration);
    root.style.setProperty("--trimit-card-lift", profile.cardLift);
    root.style.setProperty("--trimit-particle-count", String(profile.particleCount));
    root.style.setProperty("--trimit-app-bg-light", profile.palette.light.appBg);
    root.style.setProperty("--trimit-app-card-light", profile.palette.light.card);
    root.style.setProperty("--trimit-app-card-alt-light", profile.palette.light.cardAlt);
    root.style.setProperty("--trimit-app-border-light", profile.palette.light.border);
    root.style.setProperty("--trimit-app-text-light", profile.palette.light.text);
    root.style.setProperty("--trimit-app-text-muted-light", profile.palette.light.textMuted);
    root.style.setProperty("--trimit-app-accent-light", profile.palette.light.accent);
    root.style.setProperty("--trimit-app-accent-soft-light", profile.palette.light.accentSoft);
    root.style.setProperty("--trimit-app-sidebar-light", profile.palette.light.sidebar);
    root.style.setProperty("--trimit-app-bg-dark", profile.palette.dark.appBg);
    root.style.setProperty("--trimit-app-card-dark", profile.palette.dark.card);
    root.style.setProperty("--trimit-app-card-alt-dark", profile.palette.dark.cardAlt);
    root.style.setProperty("--trimit-app-border-dark", profile.palette.dark.border);
    root.style.setProperty("--trimit-app-text-dark", profile.palette.dark.text);
    root.style.setProperty("--trimit-app-text-muted-dark", profile.palette.dark.textMuted);
    root.style.setProperty("--trimit-app-accent-dark", profile.palette.dark.accent);
    root.style.setProperty("--trimit-app-accent-soft-dark", profile.palette.dark.accentSoft);
    root.style.setProperty("--trimit-app-sidebar-dark", profile.palette.dark.sidebar);

    localStorage.setItem("trimit-visual-theme", profile.id);
  }, [visualTheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  const resetVisualTheme = () => setVisualTheme(DEFAULT_VISUAL_THEME);

  const activeVisualThemeConfig = findVisualThemeConfig(visualTheme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setThemeMode: setTheme,
        toggleTheme,
        isDark: theme === "dark",
        visualTheme,
        setVisualTheme,
        resetVisualTheme,
        visualThemeOptions: VISUAL_THEME_PRESETS,
        activeVisualThemeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
