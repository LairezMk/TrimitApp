import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, BookOpen, X } from "lucide-react";
import { getGuideForPath } from "../../help/helpContent";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function PageTourOverlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const shouldOpen = params.get("tour") === "1";
  const isHelpPage = location.pathname === "/help";
  const guide = getGuideForPath(location.pathname);
  const steps = guide?.steps || [];
  const currentStep = steps[stepIndex];

  useEffect(() => {
    setStepIndex(0);
  }, [location.pathname]);

  useEffect(() => {
    if (!shouldOpen || !currentStep?.selector) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(currentStep.selector || "");
      if (!element) {
        setRect(null);
        return;
      }
      const bounding = element.getBoundingClientRect();
      setRect({
        top: Math.max(8, bounding.top - 8),
        left: Math.max(8, bounding.left - 8),
        width: bounding.width + 16,
        height: bounding.height + 16,
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [shouldOpen, currentStep]);

  if (!shouldOpen || isHelpPage || !guide || steps.length === 0) {
    return null;
  }

  const closeTour = () => {
    const next = new URLSearchParams(location.search);
    next.delete("tour");
    navigate(
      {
        pathname: location.pathname,
        search: next.toString() ? `?${next.toString()}` : "",
      },
      { replace: true },
    );
  };

  const canPrev = stepIndex > 0;
  const canNext = stepIndex < steps.length - 1;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      <div className="absolute inset-0 bg-black/60" />

      {rect && (
        <div
          className="absolute rounded-xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all duration-300"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}

      <div
        className="absolute w-full max-w-md rounded-2xl border border-white/20 bg-slate-900/95 text-white p-5 pointer-events-auto shadow-2xl"
        style={{
          right: "max(16px, env(safe-area-inset-right))",
          bottom: "max(16px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-300">Guía rápida</p>
            <h3 className="text-lg font-semibold">{guide.title}</h3>
          </div>
          <button
            onClick={closeTour}
            className="w-8 h-8 rounded-lg hover:bg-white/10 grid place-items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/5 p-3 mb-4">
          <p className="text-sm font-medium">{currentStep?.title}</p>
          <p className="text-xs text-slate-300 mt-1">{currentStep?.description}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 mb-4">
          <span>
            Paso {stepIndex + 1} de {steps.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Tour contextual
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => canPrev && setStepIndex((prev) => prev - 1)}
            disabled={!canPrev}
            className="flex-1 px-3 py-2 rounded-lg border border-white/15 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent inline-flex justify-center items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            onClick={() => (canNext ? setStepIndex((prev) => prev + 1) : closeTour())}
            className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 inline-flex justify-center items-center gap-2"
          >
            {canNext ? (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              "Finalizar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
