import { useEffect, useMemo, useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function GlobalMotionEffects() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, index) => ({
        id: index,
        size: 2 + (index % 4),
        left: (index * 17) % 100,
        delay: (index % 7) * 0.6,
        duration: 14 + (index % 8),
      })),
    [],
  );

  useEffect(() => {
    const canUseFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCursorEnabled(canUseFinePointer && !reduceMotion);
  }, []);

  useEffect(() => {
    if (!cursorEnabled) {
      return;
    }

    let dotX = window.innerWidth / 2;
    let dotY = window.innerHeight / 2;
    let ringX = dotX;
    let ringY = dotY;
    let trailX = dotX;
    let trailY = dotY;
    let frameId = 0;

    const moveCursor = (event: MouseEvent) => {
      dotX = event.clientX;
      dotY = event.clientY;

      const target = event.target as Element | null;
      const interactive = target?.closest("a, button, input, textarea, select, [role='button']");
      if (ringRef.current) {
        ringRef.current.classList.toggle("is-hovering", Boolean(interactive));
      }
    };

    const onClick = (event: MouseEvent) => {
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 700);
    };

    const onMoveNavGlow = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest(".motion-nav-button") as HTMLElement | null;
      if (!button) {
        return;
      }
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      button.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    const animate = () => {
      ringX += (dotX - ringX) * 0.18;
      ringY += (dotY - ringY) * 0.18;
      trailX += (dotX - trailX) * 0.08;
      trailY += (dotY - trailY) * 0.08;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`;
      }
      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("mousemove", onMoveNavGlow);
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("mousemove", onMoveNavGlow);
    };
  }, [cursorEnabled]);

  return (
    <>
      <div className="floating-particles text-emerald-500 dark:text-cyan-400" aria-hidden>
        {particles.map((particle) => (
          <span
            key={particle.id}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {cursorEnabled && (
        <div className="animation-layer" aria-hidden>
          <div ref={trailRef} className="cursor-trail" />
          <div ref={ringRef} className="cursor-ring" />
          <div ref={dotRef} className="cursor-dot" />
        </div>
      )}

      <div className="ripple-surface" aria-hidden>
        {ripples.map((ripple) => (
          <span key={ripple.id} className="ripple-wave" style={{ left: ripple.x, top: ripple.y }} />
        ))}
      </div>
    </>
  );
}
