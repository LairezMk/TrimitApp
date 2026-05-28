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
  const [targetMissing, setTargetMissing] = useState(false);
  const [isSmallViewport, setIsSmallViewport] = useState(false);

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
    if (!shouldOpen) {
      return;
    }

    const updateViewport = () => {
      setIsSmallViewport(window.innerWidth < 640 || window.innerHeight < 640);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, [shouldOpen]);

  useEffect(() => {
    if (!shouldOpen || !currentStep?.selector) {
      setRect(null);
      setTargetMissing(false);
      return;
    }

    const updateRect = (attempt = 0) => {
      const maxAttempts = 6;
      const element = document.querySelector(currentStep.selector || "");
      if (!element) {
        if (attempt < maxAttempts) {
          window.setTimeout(() => updateRect(attempt + 1), 140);
          return;
        }
        setRect(null);
        setTargetMissing(true);
        return;
      }
      setTargetMissing(false);
      const bounding = element.getBoundingClientRect();
      const isOffscreen =
        bounding.top < 8 || bounding.bottom > window.innerHeight - 8;

      if (isOffscreen && attempt < maxAttempts) {
        element.scrollIntoView({ behavior: attempt === 0 ? "smooth" : "auto", block: "center" });
        window.setTimeout(() => updateRect(attempt + 1), 180);
        return;
      }
      const viewportPadding = window.innerWidth < 640 ? 4 : 8;
      setRect({
        top: Math.max(viewportPadding, bounding.top - viewportPadding),
        left: Math.max(viewportPadding, bounding.left - viewportPadding),
        width: Math.min(window.innerWidth - viewportPadding * 2, bounding.width + viewportPadding * 2),
        height: Math.min(window.innerHeight - viewportPadding * 2, bounding.height + viewportPadding * 2),
      });
    };

    updateRect();
    const handleUpdate = () => updateRect(0);
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
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
    <div className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain pointer-events-auto">
      <button
        type="button"
        aria-label="Cerrar guía"
        onClick={closeTour}
        className="fixed inset-0 bg-black/65"
      />

      {rect && !isSmallViewport && (
        <div
          className="pointer-events-none fixed rounded-xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] transition-all duration-300"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}

      <div className="relative z-10 mx-auto my-4 flex min-h-[calc(100dvh-2rem)] w-full max-w-lg items-end px-3 sm:mx-4 sm:ml-auto sm:min-h-0 sm:items-start sm:px-0">
        <div className="w-full max-h-[min(82dvh,34rem)] overflow-y-auto rounded-2xl border border-white/20 bg-slate-900/95 p-4 text-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-emerald-300">Guía rápida</p>
              <h3 className="text-lg font-semibold leading-snug">{guide.title}</h3>
            </div>
            <button
              onClick={closeTour}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-white/10"
              aria-label="Cerrar guía"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/5 p-3 mb-4">
            <p className="text-sm font-medium">{currentStep?.title}</p>
            <p className="text-xs leading-relaxed text-slate-300 mt-1">{currentStep?.description}</p>
            {targetMissing && (
              <p className="text-[11px] text-amber-200 mt-2">
                Este elemento no está visible en pantalla. Ajusta el scroll o continúa.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 mb-4">
            <span>
              Paso {stepIndex + 1} de {steps.length}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Tour contextual
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
            <button
              onClick={() => canPrev && setStepIndex((prev) => prev - 1)}
              disabled={!canPrev}
              className="min-h-11 flex-1 px-3 py-2 rounded-lg border border-white/15 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent inline-flex justify-center items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={() => (canNext ? setStepIndex((prev) => prev + 1) : closeTour())}
              className="min-h-11 flex-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 inline-flex justify-center items-center gap-2"
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
    </div>
  );
}
