import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MailPlus,
  Save,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createUserSubscriptionIfNotExists } from "../services/subscriptions";
import {
  clearDetectedSubscriptionsDrafts,
  detectSubscriptionsFromGmail,
  saveDetectedSubscriptionsDrafts,
  readDetectedSubscriptionsDrafts,
  type DetectedSubscriptionDraft,
} from "../services/gmailDetection";
import { dateFromInputValue, dateToInputValue } from "../utils/date";

export default function GmailSubscriptionConfirmation() {
  const navigate = useNavigate();
  const { user, requestGmailAccessToken } = useAuth();
  const [drafts, setDrafts] = useState<DetectedSubscriptionDraft[]>(
    readDetectedSubscriptionsDrafts(),
  );
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(readDetectedSubscriptionsDrafts().map((item) => [item.id, true])),
  );
  const [saving, setSaving] = useState(false);
  const [scanningAnother, setScanningAnother] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasBankSource = useMemo(
    () => drafts.some((item) => item.source === "bank-statement"),
    [drafts],
  );

  const selectedCount = useMemo(
    () => drafts.filter((item) => selected[item.id]).length,
    [drafts, selected],
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = (
    id: string,
    key: keyof DetectedSubscriptionDraft,
    value: string | number | boolean,
  ) => {
    setDrafts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const handleSkip = () => {
    clearDetectedSubscriptionsDrafts();
    navigate("/dashboard");
  };

  const mergeDetectedDrafts = (
    current: DetectedSubscriptionDraft[],
    incoming: DetectedSubscriptionDraft[],
  ) => {
    const byName = new Map<string, DetectedSubscriptionDraft>();
    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    for (const draft of [...current, ...incoming]) {
      const key = normalize(draft.name);
      const existing = byName.get(key);
      if (!existing || draft.confidence > existing.confidence) {
        byName.set(key, draft);
      }
    }

    return Array.from(byName.values()).sort((a, b) => b.confidence - a.confidence);
  };

  const handleScanAnotherEmail = async () => {
    if (!user) {
      setError("Debes iniciar sesión para detectar suscripciones por correo.");
      return;
    }

    setScanningAnother(true);
    setError(null);

    try {
      const accessToken = await requestGmailAccessToken();
      const detected = await detectSubscriptionsFromGmail(accessToken);
      const merged = mergeDetectedDrafts(drafts, detected);
      setDrafts(merged);
      setSelected((prev) => ({
        ...prev,
        ...Object.fromEntries(merged.map((item) => [item.id, prev[item.id] ?? true])),
      }));
      saveDetectedSubscriptionsDrafts(merged);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron detectar suscripciones desde el correo.";
      setError(message);
    } finally {
      setScanningAnother(false);
    }
  };

  const handleImport = async () => {
    if (!user) {
      setError("Debes iniciar sesión para continuar.");
      return;
    }

    const toImport = drafts.filter((item) => selected[item.id]);
    if (!toImport.length) {
      setError("Selecciona al menos una suscripción para importar.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let createdCount = 0;
      let duplicateCount = 0;

      for (const item of toImport) {
        const sourceLabel =
          item.source === "bank-statement" ? "extracto bancario" : "correo";

        const result = await createUserSubscriptionIfNotExists(user.uid, {
          name: item.name.trim(),
          category: item.category,
          amount: Number(item.amount || 0),
          currency: item.currency || "$",
          status: "active",
          isRecurring: item.isRecurring,
          nextPaymentDate: dateFromInputValue(item.nextPaymentDate),
          icon: (item.icon.trim() || item.name.charAt(0) || "S").toUpperCase(),
          color: item.color || "bg-emerald-500",
          notes: `Detectada desde ${sourceLabel}. Referencia: ${item.subject}`,
          source: item.source,
        });

        if (result.created) {
          createdCount += 1;
        } else {
          duplicateCount += 1;
        }
      }

      if (!createdCount && duplicateCount) {
        setError("Las suscripciones seleccionadas ya existen y no se duplicaron.");
        return;
      }

      clearDetectedSubscriptionsDrafts();
      navigate("/subscriptions");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo importar.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <button
        onClick={handleSkip}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Omitir por ahora
      </button>

      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Detección automática</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Revisamos la información detectada y te proponemos posibles
          suscripciones para importar con seguridad.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 p-4 flex items-start gap-3">
        <Mail className="w-5 h-5 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        <div className="text-sm text-emerald-800 dark:text-emerald-300">
          Detectamos <strong>{drafts.length}</strong> coincidencias desde{" "}
          <strong>{hasBankSource ? "extracto bancario/correo" : "correo"}</strong>.
          Revisa montos y próxima renovación antes de importar.
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleScanAnotherEmail}
          disabled={scanningAnother || saving}
          className="w-full sm:w-auto px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {scanningAnother ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Escaneando...
            </>
          ) : (
            <>
              <MailPlus className="w-4 h-4" />
              Escanear otro correo
            </>
          )}
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 sm:self-center">
          Úsalo para autorizar otra cuenta Gmail y sumar sus resultados sin duplicados.
        </p>
      </div>

      {drafts.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-gray-600 dark:text-gray-300">
          No encontramos suscripciones claras para importar.
        </div>
      )}

      <div className="space-y-4">
        {drafts.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(selected[item.id])}
                  onChange={() => toggleSelect(item.id)}
                  className="h-5 w-5"
                />
                <div
                  className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center text-white`}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Confianza de detección: {item.confidence}%
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>De: {item.from}</p>
                <p className="truncate max-w-[420px]">Asunto: {item.subject}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                <input
                  value={item.name}
                  onChange={(e) => handleFieldChange(item.id, "name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoría</label>
                <input
                  value={item.category}
                  onChange={(e) =>
                    handleFieldChange(item.id, "category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) =>
                    handleFieldChange(item.id, "amount", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Próxima renovación
                </label>
                <SubscriptionDatePicker
                  value={item.nextPaymentDate}
                  onChange={(value) =>
                    handleFieldChange(item.id, "nextPaymentDate", value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex flex-col md:flex-row gap-3">
        <button
          onClick={handleSkip}
          className="md:w-40 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Omitir
        </button>
        <button
          onClick={handleImport}
          disabled={saving || drafts.length === 0}
          className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            "Importando..."
          ) : (
            <>
              <Save className="w-4 h-4" />
              Importar seleccionadas ({selectedCount})
            </>
          )}
        </button>
        <button
          onClick={() =>
            setSelected(
              Object.fromEntries(drafts.map((item) => [item.id, true])),
            )
          }
          className="md:w-52 px-6 py-3 border border-emerald-300 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors inline-flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Seleccionar todo
        </button>
      </div>
    </div>
  );
}

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const WEEK_DAYS = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];

function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getInitialMonth(value: string) {
  if (!value) {
    return new Date();
  }
  const parsed = dateFromInputValue(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDisplayDate(value: string) {
  if (!value) {
    return "Seleccionar fecha";
  }
  const parsed = dateFromInputValue(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(parsed)
    .replace(".", "");
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function SubscriptionDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getInitialMonth(value));
  const selectedDate = value ? dateFromInputValue(value) : null;
  const today = new Date();
  const days = buildCalendarDays(visibleMonth);

  const moveMonth = (amount: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const selectDate = (date: Date) => {
    onChange(dateToInputValue(date));
    setVisibleMonth(date);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setVisibleMonth(getInitialMonth(value));
          setOpen((current) => !current);
        }}
        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-950/20 px-3 py-2.5 text-left text-sm text-white shadow-inner shadow-emerald-950/20 transition hover:border-emerald-300/50 hover:bg-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
      >
        <span className={value ? "font-medium" : "text-emerald-100/60"}>
          {formatDisplayDate(value)}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-300/15 bg-emerald-300/5 text-emerald-200 transition group-hover:bg-emerald-300/10">
          <Calendar className="h-4 w-4" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-emerald-300/20 bg-[#06231d] shadow-2xl shadow-black/45 ring-1 ring-white/5">
          <div className="border-b border-emerald-300/10 bg-gradient-to-r from-emerald-500/14 to-cyan-400/10 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/70">
                  Próxima renovación
                </p>
                <p className="mt-1 text-base font-semibold capitalize text-white">
                  {MONTH_NAMES[visibleMonth.getMonth()]} de {visibleMonth.getFullYear()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveMonth(-1)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-300/15 text-emerald-100 transition hover:bg-emerald-300/10"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-300/15 text-emerald-100 transition hover:bg-emerald-300/10"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-[11px] font-semibold text-emerald-100/55"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                const isSelected = selectedDate ? sameDate(day, selectedDate) : false;
                const isToday = sameDate(day, today);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => selectDate(day)}
                    className={`relative grid h-9 place-items-center rounded-lg text-sm transition ${
                      isSelected
                        ? "bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/25"
                        : isCurrentMonth
                          ? "text-white hover:bg-emerald-300/12"
                          : "text-emerald-100/35 hover:bg-emerald-300/8"
                    }`}
                  >
                    <span>{day.getDate()}</span>
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cyan-300" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-emerald-300/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-100/70 transition hover:bg-white/5 hover:text-white"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={() => selectDate(today)}
                className="rounded-lg bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
