import { useEffect, useState, type ComponentType } from "react";
import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Loader2,
  MailSearch,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  detectSubscriptionsFromGmail,
  saveDetectedSubscriptionsDrafts,
} from "../../services/gmailDetection";
import { consumeRecentGmailAccessToken } from "../../services/gmailAccessTokenSession";
import {
  clearWelcomeOnboardingPending,
  hasWelcomeOnboardingPending,
} from "../../services/welcomeOnboardingSession";

type WelcomePhase = "checking" | "welcome" | "scanning" | "scanError" | "hidden";

const FIRST_GMAIL_SCAN_TIMEOUT_MS = 75_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });
}

function isGoogleMailProfile(user: User) {
  return user.providerData.some(
    (provider) => provider.providerId === "google.com",
  );
}

function getFirstName(user: User) {
  const displayName = user.displayName?.trim();
  if (displayName) {
    return displayName.split(/\s+/)[0];
  }

  return user.email?.split("@")[0] || "bienvenido";
}

function hasSeenWelcome(data: Record<string, unknown> | undefined) {
  const preferences = (data?.preferences || {}) as Record<string, unknown>;
  return Boolean(data?.trimitWelcomeShownAt || preferences.trimitWelcomeShownAt);
}

function hasPendingWelcome(data: Record<string, unknown> | undefined) {
  const preferences = (data?.preferences || {}) as Record<string, unknown>;
  return Boolean(data?.trimitWelcomePending || preferences.trimitWelcomePending);
}

async function markWelcomeAsSeen(uid: string) {
  await setDoc(
    doc(db, "users", uid),
    {
      trimitWelcomePending: false,
      trimitWelcomeShownAt: serverTimestamp(),
      trimitWelcomeVersion: 1,
      preferences: {
        trimitWelcomePending: false,
        trimitWelcomeShownAt: serverTimestamp(),
        trimitWelcomeVersion: 1,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function WelcomeOnboarding() {
  const navigate = useNavigate();
  const { user, requestGmailAccessToken } = useAuth();
  const [phase, setPhase] = useState<WelcomePhase>("checking");
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWelcomeState = async () => {
      if (!user) {
        setPhase("hidden");
        return;
      }

      setPhase("checking");
      setScanError(null);

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data() as Record<string, unknown> | undefined;
        const shouldShowWelcome =
          !hasSeenWelcome(data) &&
          (hasPendingWelcome(data) || hasWelcomeOnboardingPending(user.uid));
        if (!cancelled) {
          setPhase(shouldShowWelcome ? "welcome" : "hidden");
        }
      } catch {
        if (!cancelled) {
          setPhase(hasWelcomeOnboardingPending(user.uid) ? "welcome" : "hidden");
        }
      }
    };

    void loadWelcomeState();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const completeWelcome = async () => {
    if (!user || phase === "scanning") {
      return;
    }

    const recentGoogleToken = consumeRecentGmailAccessToken();
    const shouldScanGmail = Boolean(recentGoogleToken || isGoogleMailProfile(user));
    const accessTokenPromise = shouldScanGmail
      ? recentGoogleToken
        ? Promise.resolve(recentGoogleToken)
        : requestGmailAccessToken()
      : null;

    setScanError(null);
    setPhase(shouldScanGmail ? "scanning" : "hidden");

    try {
      await markWelcomeAsSeen(user.uid);
    } catch {
      // Si no se puede guardar en este instante, no bloqueamos la entrada.
    } finally {
      clearWelcomeOnboardingPending(user.uid);
    }

    if (!accessTokenPromise) {
      return;
    }

    try {
      const accessToken = await accessTokenPromise;
      const detected = await withTimeout(
        detectSubscriptionsFromGmail(accessToken),
        FIRST_GMAIL_SCAN_TIMEOUT_MS,
        "La búsqueda en Gmail tardó más de lo esperado. Inténtalo de nuevo desde Suscripciones.",
      );
      saveDetectedSubscriptionsDrafts(detected);
      setPhase("hidden");
      navigate("/subscriptions/gmail-confirmation");
    } catch (err) {
      setScanError(
        err instanceof Error
          ? err.message
          : "No se pudieron detectar suscripciones desde tu correo.",
      );
      setPhase("scanError");
    }
  };

  const goToDashboard = async () => {
    if (user) {
      try {
        await markWelcomeAsSeen(user.uid);
      } catch {
        // No interrumpimos al usuario por un fallo temporal de guardado.
      } finally {
        clearWelcomeOnboardingPending(user.uid);
      }
    }
    setPhase("hidden");
    navigate("/dashboard");
  };

  if (phase === "hidden" || phase === "checking") {
    return null;
  }

  const firstName = user ? getFirstName(user) : "bienvenido";

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center overflow-y-auto bg-slate-950/80 px-4 py-6 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[12%] h-28 w-28 rounded-full border border-cyan-300/30 bg-cyan-400/10 blur-[1px] animate-pulse" />
        <div className="absolute right-[10%] top-[18%] h-40 w-40 rounded-full border border-emerald-300/20 bg-emerald-400/10 animate-pulse" />
        <div className="absolute bottom-[12%] left-[18%] h-48 w-48 rounded-full border border-emerald-200/15 bg-emerald-500/10 blur-sm animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(16,185,129,.22),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(6,182,212,.18),transparent_28%),linear-gradient(135deg,rgba(2,6,23,.92),rgba(6,78,59,.66))]" />
      </div>

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#061f1b]/95 shadow-2xl shadow-emerald-950/60 ring-1 ring-white/10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500" />
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl" />

        {phase === "welcome" && (
          <button
            type="button"
            onClick={completeWelcome}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-emerald-50 transition hover:bg-white/10"
            aria-label="Cerrar bienvenida"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="relative p-6 sm:p-8">
          {phase === "welcome" ? (
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/15 text-emerald-100 shadow-lg shadow-emerald-500/20">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
                    Trimit está listo
                  </p>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Hola, {firstName}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-emerald-50/90">
                  Bienvenido a tu centro de control de suscripciones. Vamos a
                  ayudarte a encontrar cobros recurrentes, ordenar tus fechas de
                  pago y dejar todo listo para que no se te escape nada.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <WelcomePoint
                    icon={MailSearch}
                    title="Detección inteligente"
                    text="Buscamos señales reales de cobro en tu correo."
                  />
                  <WelcomePoint
                    icon={BellRing}
                    title="Alertas útiles"
                    text="Te avisamos antes de renovaciones importantes."
                  />
                  <WelcomePoint
                    icon={ShieldCheck}
                    title="Tú decides"
                    text="Revisas todo antes de importar suscripciones."
                  />
                </div>

                {user && isGoogleMailProfile(user) && (
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
                    Al continuar, Trimit abrirá la autorización de Gmail para
                    detectar tus posibles suscripciones automáticamente.
                  </div>
                )}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={completeWelcome}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-4 font-semibold text-white shadow-xl shadow-emerald-500/25 transition hover:scale-[1.01] hover:from-emerald-400 hover:to-cyan-400"
                >
                  Comenzar
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={completeWelcome}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-4 font-semibold text-emerald-50 transition hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>
            </>
          ) : phase === "scanning" ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-100 shadow-xl shadow-cyan-500/20">
                <Loader2 className="h-9 w-9 animate-spin" />
              </div>
              <h2 className="text-3xl font-bold text-white">Buscando suscripciones</h2>
              <p className="mx-auto mt-3 max-w-md text-emerald-50/75">
                Estamos revisando señales de cobros recurrentes en tu correo.
                En unos segundos te mostraremos lo encontrado para que lo revises.
              </p>
              <div className="mx-auto mt-7 h-2 max-w-sm overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-amber-300/25 bg-amber-400/10 text-amber-100">
                <MailSearch className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                No pudimos escanear el correo
              </h2>
              <p className="mx-auto mt-3 max-w-md text-emerald-50/75">
                {scanError || "Puedes intentarlo luego desde la página de suscripciones."}
              </p>
              <button
                type="button"
                onClick={goToDashboard}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                Ir al dashboard
                <CheckCircle2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomePoint({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-300/15 bg-white/[0.045] p-4 shadow-inner shadow-emerald-950/20">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-100">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-emerald-50/70">{text}</p>
    </div>
  );
}
